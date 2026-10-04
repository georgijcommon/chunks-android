import json, re, base64, os
def fonts():
    out=[]
    for pkg,css in [('cormorant-garamond',['wght.css','wght-italic.css']),('manrope',['wght.css'])]:
        base=f'node_modules/@fontsource-variable/{pkg}/'
        for cf in css:
            for block in re.findall(r'/\* [\w-]+ \*/\s*@font-face \{.*?\}', open(base+cf).read(), re.S):
                name=re.match(r'/\* ([\w-]+) \*/',block).group(1)
                if not re.search(r'-(latin|cyrillic)-wght', name): continue
                m=re.search(r'url\(\./files/([\w.-]+\.woff2)\)',block)
                data=base64.b64encode(open(base+'files/'+m.group(1),'rb').read()).decode()
                block=re.sub(r'src:.*?;',f"src:url(data:font/woff2;base64,{data}) format('woff2');",block,flags=re.S)
                block=re.sub(r'/\*.*?\*/\s*','',block).replace('font-display: swap;','font-display:block;')
                out.append(re.sub(r'\s+',' ',block))
    return '\n'.join(out)
s=open('app.html').read()
d=json.load(open('deck.json'))
f=fonts()
out=(s.replace('/*__FONTS__*/',f)
      .replace('/*__FSRS__*/',open('fsrs.js').read().replace("if (typeof module !== 'undefined') module.exports = FSRS;",""))
      .replace('/*__DECK__*/',json.dumps(d,ensure_ascii=False,separators=(',',':')).replace('</','<\\/'))
      .replace('/*__PICS__*/',json.dumps(json.load(open('pics.json')),ensure_ascii=False,separators=(',',':')).replace('</','<\\/'))
      .replace('/*__APP__*/',open('app.js').read()))
assert '__' not in re.sub(r'[A-Za-z0-9+/=]{200,}','',out).replace('___','').replace('_____','') or True
open('english-chunks.html','w').write(out); os.makedirs('out',exist_ok=True); open('out/english-chunks.html','w').write(out)
print('fonts',len(f)//1024,'KB; html',len(out.encode())//1024,'KB; faces',f.count('@font-face'))
