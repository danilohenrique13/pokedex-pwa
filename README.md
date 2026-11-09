# Pokédex PWA

Aplicação web progressiva (PWA) para explorar Pokémon, desenvolvida com HTML5, CSS3 e JavaScript puro (Vanilla JS), consumindo a [PokéAPI](https://pokeapi.co/).

## Funcionalidades

- Catálogo de Pokémon com imagem, número e tipos.
- Pesquisa por nome ou número.
- Filtro por tipo e atalhos para tipos populares.
- Paginação com botão **Carregar mais Pokémon**.
- Janela de detalhes com altura, peso, habilidades e estatísticas.
- Interface responsiva para celular, tablet e desktop.
- Estados de carregamento, mensagens de erro e indicação de conectividade.
- Acessibilidade básica: labels, estados `aria-pressed`, foco visível, botão para pular ao conteúdo e respeito a `prefers-reduced-motion`.
- Instalação como aplicativo, quando oferecida pelo navegador.
- Service Worker com cache dos arquivos essenciais, consultas já realizadas à PokéAPI e imagens carregadas.
- Recurso de câmera para capturar uma foto do treinador e armazená-la localmente com IndexedDB.

## Tecnologias

- HTML5, CSS3 e JavaScript (sem frameworks ou dependências de build).
- Fetch API e PokéAPI.
- Web App Manifest.
- Service Worker e Cache API.
- MediaDevices API (`getUserMedia`) e Canvas API.
- IndexedDB para persistir a foto capturada no próprio navegador.

## Como executar localmente

O Service Worker e a câmera exigem um contexto seguro. Use `localhost` ou HTTPS; abrir o arquivo `index.html` diretamente (`file://`) não é suficiente para testar esses recursos.

1. Baixe ou clone este repositório.
2. Abra a pasta do projeto no VS Code.
3. Inicie um servidor local, por exemplo com a extensão **Live Server**.
4. Acesse o endereço informado pelo Live Server, normalmente `http://127.0.0.1:5500`.

Não é necessário instalar dependências nem executar um processo de build.

## Instalar o aplicativo

Em navegadores compatíveis, use o botão **Instalar aplicativo**, quando ele aparecer, ou a opção de instalação do próprio navegador. A disponibilidade do prompt varia conforme o navegador, o sistema operacional e os critérios de instalação da plataforma. No iPhone/iPad, quando o prompt automático não estiver disponível, a instalação pode ser feita pelo menu de compartilhamento do Safari, usando **Adicionar à Tela de Início**.

## Recurso de câmera

Na seção **Foto do Treinador**:

1. Toque em **Abrir câmera** e conceda a permissão solicitada pelo navegador.
2. Toque em **Capturar foto** para registrar a imagem.
3. A foto é armazenada no IndexedDB deste navegador/dispositivo.
4. Use **Remover foto** para apagá-la.

A câmera só é solicitada após uma ação explícita. O aplicativo não solicita acesso ao microfone e não envia a fotografia para a PokéAPI ou para outro servidor. A permissão de câmera depende de HTTPS (ou `localhost`) e do suporte do navegador. Limpar os dados do site ou do navegador pode apagar a fotografia armazenada.

## Funcionamento offline

Após uma primeira visita com conexão, o Service Worker armazena os arquivos essenciais do aplicativo. Consultas à PokéAPI e imagens carregadas também podem ser armazenadas no cache do navegador.

- A interface principal pode abrir offline depois que os arquivos essenciais forem armazenados.
- Pokémon, detalhes e imagens consultados anteriormente podem continuar disponíveis, conforme o conteúdo mantido no cache.
- O catálogo completo não é baixado antecipadamente; portanto, uma busca por Pokémon nunca consultado pode não funcionar sem internet.
- O cache é limitado para evitar crescimento indefinido, e o navegador pode remover dados por políticas de armazenamento.
- O indicador de conexão informa o estado de rede reportado pelo navegador; isso não garante que a PokéAPI esteja disponível.

## API

A aplicação utiliza endpoints da PokéAPI:

- `GET https://pokeapi.co/api/v2/pokemon?limit=20&offset=0`
- `GET https://pokeapi.co/api/v2/pokemon/{nome-ou-id}`
- `GET https://pokeapi.co/api/v2/type/{tipo}`

## Publicar no GitHub Pages

1. Envie os arquivos do projeto para a branch `main` do repositório.
2. No GitHub, abra **Settings → Pages**.
3. Em **Build and deployment**, escolha **Deploy from a branch**.
4. Selecione `main` e a pasta `/ (root)`, depois clique em **Save**.
5. Aguarde a publicação e abra a aplicação em HTTPS.

Os caminhos do Manifest e do Service Worker são relativos à pasta do projeto, permitindo publicação em um endereço com subpasta, como `https://SEU_USUARIO.github.io/pokedex-pwa/`.

## Publicar em um novo repositório GitHub

Esta versão deve ser publicada em um repositório separado, sem alterar o repositório original da Pokédex. Sugestão de nome: `pokedex-pwa`.

1. Crie um repositório público novo no GitHub chamado `pokedex-pwa`. Não marque a opção de adicionar README, `.gitignore` ou licença, pois os arquivos já estão nesta pasta.
2. Abra o terminal nesta pasta do projeto (a pasta que contém `index.html`).
3. Execute os comandos abaixo, substituindo `SEU_USUARIO` pelo seu nome de usuário do GitHub:

```bash
git init
git add .
git commit -m "Publica Pokédex como PWA com recurso de câmera"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/pokedex-pwa.git
git push -u origin main
```

4. No novo repositório, abra **Settings → Pages**.
5. Em **Build and deployment**, escolha **Deploy from a branch**, selecione `main` e `/ (root)`, depois clique em **Save**.
6. Aguarde a publicação. O endereço esperado será `https://SEU_USUARIO.github.io/pokedex-pwa/`.

**Importante:** esta pasta foi preparada sem a pasta `.git` do projeto anterior. Assim, ao executar `git init`, você cria um histórico independente. Não execute esses comandos dentro da pasta do projeto original.

## Checklist de validação antes da entrega

- [ ] Abrir a aplicação publicada em HTTPS.
- [ ] Verificar catálogo, pesquisa, filtros, paginação e modal.
- [ ] Conferir no DevTools → Application se o Manifest foi reconhecido.
- [ ] Conferir se o Service Worker foi instalado e está ativo.
- [ ] Recarregar a página e testar a abertura offline.
- [ ] Testar a câmera em dispositivo com câmera e autorizar a permissão.
- [ ] Capturar uma foto, recarregar a página e confirmar que ela permanece.
- [ ] Remover a foto e confirmar que ela desapareceu.
- [ ] Testar em larguras de celular, tablet e desktop.
- [ ] Executar Lighthouse na versão publicada e registrar os resultados reais.

## Créditos

Dados e imagens obtidos da [PokéAPI](https://pokeapi.co/). Projeto acadêmico.
