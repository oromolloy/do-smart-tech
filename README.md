# Do Smart Tech — site institucional (beta)

Landing page de página única da Do Smart Tech: HTML5, CSS3 e JavaScript puro. O [Vite](https://vite.dev) só
empacota a versão final (CSS e JS minificados, arquivos com hash no nome para não ficar preso no cache).

- `index.html` — conteúdo, SEO (metadados, Open Graph, JSON-LD) e sprite de ícones
- `style.css` — estilos em BEM, mobile first, tokens em variáveis CSS
- `script.js` — menu, seção ativa, revelação ao rolar e links do WhatsApp (número em `WHATSAPP_NUMBER`)
- `assets/` — logos, símbolo, fontes, favicons e logos dos fabricantes
- `public/` — arquivos copiados sem mudar o nome (imagem de compartilhamento e ícone 512 do JSON-LD)
- `.env` — endereço público do site

## Requisitos

Node.js 20.19+ ou 22.12+.

## Comandos

```bash
npm ci            # instala o Vite (só na primeira vez ou quando o package-lock.json mudar)
npm run dev       # servidor local para editar; a página recarrega sozinha ao salvar
npm run build     # gera a versão final na pasta dist/
npm run preview   # serve a dist/ localmente para conferir antes de subir
```

## Trocar o domínio

Edite `VITE_SITE_URL` no arquivo `.env` (com ou sem `/` no fim) e rode `npm run build` de novo. Esse endereço vai
para o canonical, o Open Graph, o Twitter e o JSON-LD.

## Publicar

1. Rode `npm run build`.
2. Copie **o conteúdo** da pasta `dist/` (não a pasta em si) para a raiz do site ou para qualquer subpasta do
   servidor. Os caminhos são relativos: não é preciso configurar o servidor nem criar `.htaccess`.
3. Abra pelo endereço da pasta (ex.: `https://seudominio.com.br/`), sem `/index.html`.

O site precisa ser servido por HTTP (qualquer hospedagem comum serve). Abrir o `dist/index.html` com duplo clique
(`file://`) não funciona: o navegador bloqueia o script nesse modo.
