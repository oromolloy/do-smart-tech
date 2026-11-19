# Do Smart Tech — site institucional (beta)

Landing page de página única da Do Smart Tech: HTML5, CSS3 e JavaScript puro. O [Vite](https://vite.dev) só
empacota a versão final (CSS e JS minificados, arquivos com hash no nome para não ficar preso no cache).

- `index.html` — conteúdo, SEO (metadados, Open Graph, JSON-LD) e sprite de ícones
- `style.css` — estilos em BEM, mobile first, tokens em variáveis CSS
- `script.js` — menu, seção ativa, revelação ao rolar e links do WhatsApp (número em `WHATSAPP_NUMBER`)
- `assets/` — logos, símbolo, fontes, favicons e logos dos fabricantes
- `public/` — arquivos copiados sem mudar o nome (imagem de compartilhamento, ícone 512 do JSON-LD e `.htaccess`)
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

O domínio de produção é `https://dosmarttech.com.br/`, definido em `VITE_SITE_URL` no arquivo `.env`. Só troque se
o domínio mudar: edite a variável (com ou sem `/` no fim) e rode `npm run build` de novo. Esse endereço vai para o
canonical, o Open Graph, o Twitter e o JSON-LD.

## Publicar

1. Rode `npm run build`.
2. Copie **o conteúdo** da pasta `dist/` (não a pasta em si) para a raiz do site ou para qualquer subpasta do
   servidor, incluindo o arquivo oculto `.htaccess` (alguns programas de FTP escondem arquivos que começam com
   ponto). Os caminhos são relativos: o site funciona sem configurar o servidor.
3. Abra pelo endereço da pasta (ex.: `https://dosmarttech.com.br/`), sem `/index.html`.

**A raiz do repositório não é o site.** Ela guarda os arquivos-fonte: o HTML com `%SITE_URL%` literal no lugar do
domínio e o CSS e o JS sem minificar e sem hash no nome. Servir a raiz foi o que o PageSpeed mediu em
dosmarttech.com.br. O servidor deve receber só o conteúdo de `dist/`, sempre de um `npm run build` recém-rodado.

O site precisa ser servido por HTTP (qualquer hospedagem comum serve). Abrir o `dist/index.html` com duplo clique
(`file://`) não funciona: o navegador bloqueia o script nesse modo.

## Bloqueio e cache no Apache (`.htaccess`)

O `public/.htaccess` vai para a raiz do `dist/` no build. Em servidor Apache ele:

- libera só o que o site usa (páginas `.html`, CSS e JS com hash do build, imagens, fontes e a licença das fontes
  `OFL.txt`) e responde 403 a todo o resto: `README.md`, `package.json`, `.env`, arquivos `.md`, `.map`, arquivos
  ocultos e o CSS e o JS da raiz sem hash;
- desliga a listagem de pastas (`Options -Indexes`);
- aplica o cache descrito abaixo (só se o módulo `mod_headers` estiver ativo; sem ele o site funciona sem o cache).

Antes de publicar, confira com quem cuida da hospedagem:

- **Ele substitui o `.htaccess` que já existir na raiz do servidor.** Se houver regra lá (por exemplo, redirecionar
  para `https` ou para o endereço sem `www`), ela precisa ser copiada para este arquivo antes, ou some.
- Antes de apagar o conteúdo antigo da raiz do servidor (`public_html`, por exemplo), baixe uma cópia do `.htaccess`
  e da pasta `.well-known`. Não apague `.well-known` nem `cgi-bin`: a hospedagem usa essas pastas.
- O endereço `/.well-known/` continua liberado (no Apache 2.4), porque é por ele que a hospedagem valida e renova o
  certificado SSL (AutoSSL ou Let's Encrypt). Bloqueá-lo faz o certificado vencer.
- A hospedagem precisa permitir `.htaccess` com `AllowOverride All` (o comum). Se ela não permitir `Options` no
  `.htaccess`, o site inteiro responde erro 500: nesse caso, apague a linha `Options -Indexes`.
- Logo depois de publicar, abra `https://dosmarttech.com.br/` e `https://dosmarttech.com.br/README.md`: a página
  deve abrir e o README deve dar 403 (ou 404).

Em servidor que não é Apache (Nginx, por exemplo), o `.htaccess` é ignorado e o bloqueio e o cache precisam ser
configurados no próprio servidor.

## Cache no servidor

No Apache, o `.htaccess` acima já aplica estas regras. Em outro servidor, configure no painel ou na configuração dele.

- Arquivos direto em `assets/` (têm hash no nome e mudam de nome a cada build):
  `Cache-Control: public, max-age=31536000, immutable`.
- Páginas `.html` (`index.html`, `privacidade/index.html`): `Cache-Control: no-cache` (ou `max-age` curto), para a
  versão nova aparecer logo após publicar.
- Subpastas `assets/images/`, `assets/icons/` e `assets/fonts/` (vêm de `public/`, sem hash no nome): cache
  moderado, por exemplo `Cache-Control: public, max-age=86400` (1 dia). Não use `immutable` nelas.
