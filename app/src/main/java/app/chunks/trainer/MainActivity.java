package app.chunks.trainer;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import com.google.mlkit.common.model.DownloadConditions;
import com.google.mlkit.nl.translate.TranslateLanguage;
import com.google.mlkit.nl.translate.Translation;
import com.google.mlkit.nl.translate.Translator;
import com.google.mlkit.nl.translate.TranslatorOptions;

import org.json.JSONObject;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Оболочка вокруг тренажёра: страница лежит в assets/index.html и работает без сети.
 * Оболочка добавляет то, чего нет у встроенного браузера: сохранение файла,
 * выбор файла, синтез речи и кнопку «Назад».
 */
public class MainActivity extends Activity {
    private static final int REQ_SAVE = 1;
    private static final int REQ_OPEN = 2;

    private WebView web;
    private ValueCallback<Uri[]> fileCallback;
    private String pendingSave;
    private TextToSpeech tts;
    private boolean ttsReady;
    private final Map<String, Translator> translators = new HashMap<>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        web = new WebView(this);
        web.setBackgroundColor(getColor(R.color.bg));
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);   // прогресс хранится в localStorage
        s.setTextZoom(100);

        web.addJavascriptInterface(new Bridge(), "Android");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                // Страница одна; любые внешние ссылки не открываем.
                return !"file".equals(request.getUrl().getScheme());
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback,
                                             FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                Intent pick = new Intent(Intent.ACTION_GET_CONTENT);
                pick.addCategory(Intent.CATEGORY_OPENABLE);
                pick.setType("*/*");
                try {
                    startActivityForResult(pick, REQ_OPEN);
                } catch (ActivityNotFoundException e) {
                    fileCallback = null;
                    callback.onReceiveValue(null);
                    toast("Не найдено приложение для выбора файла");
                }
                return true;
            }
        });

        tts = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) {
                tts.setLanguage(Locale.US);
                ttsReady = true;
            }
        });

        if (savedInstanceState == null || web.restoreState(savedInstanceState) == null) {
            web.loadUrl("file:///android_asset/index.html");
        }
    }

    /** Методы, которые страница вызывает как Android.saveFile(...) и Android.speak(...). */
    private class Bridge {
        @JavascriptInterface
        public void saveFile(String name, String content) {
            runOnUiThread(() -> {
                pendingSave = content;
                Intent create = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                create.addCategory(Intent.CATEGORY_OPENABLE);
                create.setType("application/json");
                create.putExtra(Intent.EXTRA_TITLE, name);
                try {
                    startActivityForResult(create, REQ_SAVE);
                } catch (ActivityNotFoundException e) {
                    pendingSave = null;
                    toast("Не найдено приложение для сохранения файла");
                }
            });
        }

        /** Перевод на устройстве; ответ возвращается в window.onTranslated(id, ok, text). */
        @JavascriptInterface
        public void translate(int id, String text, String from, String to) {
            runOnUiThread(() -> {
                String src = TranslateLanguage.fromLanguageTag(from);
                String dst = TranslateLanguage.fromLanguageTag(to);
                if (src == null || dst == null) {
                    reply(id, false, "");
                    return;
                }
                String key = src + ">" + dst;
                Translator t = translators.get(key);
                if (t == null) {
                    t = Translation.getClient(new TranslatorOptions.Builder()
                            .setSourceLanguage(src).setTargetLanguage(dst).build());
                    translators.put(key, t);
                }
                final Translator tr = t;
                tr.downloadModelIfNeeded(new DownloadConditions.Builder().build())
                        .addOnSuccessListener(unused -> tr.translate(text)
                                .addOnSuccessListener(result -> reply(id, true, result))
                                .addOnFailureListener(e -> reply(id, false, "")))
                        .addOnFailureListener(e -> reply(id, false, ""));
            });
        }

        @JavascriptInterface
        public void speak(String text) {
            runOnUiThread(() -> {
                if (ttsReady) {
                    tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "chunk");
                } else {
                    toast("Синтез речи на этом устройстве недоступен");
                }
            });
        }
    }

    private void reply(int id, boolean ok, String text) {
        runOnUiThread(() -> {
            if (web != null) {
                web.evaluateJavascript("window.onTranslated && window.onTranslated(" + id + "," + ok + ","
                        + JSONObject.quote(text) + ")", null);
            }
        });
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        Uri uri = (resultCode == RESULT_OK && data != null) ? data.getData() : null;
        if (requestCode == REQ_OPEN) {
            if (fileCallback != null) {
                fileCallback.onReceiveValue(uri != null ? new Uri[]{uri} : null);
                fileCallback = null;
            }
        } else if (requestCode == REQ_SAVE) {
            String content = pendingSave;
            pendingSave = null;
            if (uri == null || content == null) return;
            try (OutputStream out = getContentResolver().openOutputStream(uri)) {
                if (out == null) throw new java.io.IOException("no stream");
                out.write(content.getBytes(StandardCharsets.UTF_8));
                toast("Файл сохранён");
            } catch (Exception e) {
                toast("Не удалось сохранить файл");
            }
        }
    }

    @Override
    public void onBackPressed() {
        // Страница сама решает: вернуться на главный экран или выйти.
        web.evaluateJavascript("(window.appBack && window.appBack()) === true", handled -> {
            if (!"true".equals(handled)) finish();
        });
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        web.saveState(outState);
    }

    @Override
    protected void onDestroy() {
        if (tts != null) tts.shutdown();
        for (Translator t : translators.values()) t.close();
        super.onDestroy();
    }

    private void toast(String text) {
        Toast.makeText(this, text, Toast.LENGTH_SHORT).show();
    }
}
