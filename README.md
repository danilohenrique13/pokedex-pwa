# Pokédex PWA

Uma evolução da minha primeira Pokédex: uma aplicação web progressiva (PWA) desenvolvida com HTML5, CSS3 e JavaScript puro (Vanilla JS), que permite explorar Pokémon por meio da [PokéAPI](https://pokeapi.co/), com recursos de instalação, funcionamento offline e acesso à câmera do dispositivo.

## Sobre o projeto

Este projeto é uma evolução de uma Pokédex que desenvolvi anteriormente como forma de praticar desenvolvimento web e consumo de APIs.

A partir da versão original, ampliei a aplicação com recursos de Progressive Web App (PWA), armazenamento local, suporte offline e integração com funcionalidades de hardware do dispositivo.

**Projeto original:** [Pokédex — primeira versão](https://github.com/danilohenrique13/pokedex)

**Projeto atual:** [Pokédex PWA](https://github.com/danilohenrique13/pokedex-pwa)

## Contexto acadêmico

Projeto acadêmico desenvolvido como parte da disciplina **Coding: Mobile**, ministrada pelo professor **Geraldo Cruz**, no curso de **Análise e Desenvolvimento de Sistemas (ADS)** da **Faculdade SENAC**, durante o **3º período**.

A proposta é aplicar conhecimentos de desenvolvimento web para construir uma aplicação progressiva, responsiva e capaz de utilizar recursos disponíveis nos dispositivos móveis.

## Funcionalidades

- Catálogo de Pokémon com imagem, número e tipos.
- Pesquisa por nome ou número.
- Filtro por tipo e atalhos para tipos populares.
- Paginação com botão **Carregar mais Pokémon**.
- Janela de detalhes com altura, peso, habilidades e estatísticas.
- Interface responsiva para celulares, tablets e desktops.
- Estados de carregamento, mensagens de erro e indicação de conectividade.
- Acessibilidade básica: labels, estados `aria-pressed`, foco visível, botão para pular ao conteúdo e respeito a `prefers-reduced-motion`.
- Instalação como aplicativo, quando oferecida pelo navegador.
- Service Worker com cache dos arquivos essenciais, consultas já realizadas à PokéAPI e imagens carregadas.
- Recurso de câmera para capturar uma foto do treinador e armazená-la localmente com IndexedDB.

## Tecnologias utilizadas

- **HTML5:** estrutura e organização do conteúdo.
- **CSS3:** estilização e responsividade.
- **JavaScript (Vanilla JS):** lógica e interatividade, sem frameworks.
- **Fetch API:** comunicação com serviços externos.
- **PokéAPI:** fornecimento de dados e imagens dos Pokémon.
- **Web App Manifest:** configuração de instalação da aplicação.
- **Service Worker:** gerenciamento de cache e suporte offline.
- **Cache API:** armazenamento de recursos e consultas.
- **MediaDevices API (`getUserMedia`):** acesso à câmera do dispositivo.
- **Canvas API:** captura e processamento da imagem.
- **IndexedDB:** armazenamento persistente da fotografia no navegador.

## Como executar localmente

O Service Worker e o acesso à câmera exigem um contexto seguro. Utilize `localhost` ou HTTPS. Abrir o arquivo `index.html` diretamente (`file://`) não é suficiente para testar esses recursos.

1. Clone ou baixe este repositório.
2. Abra a pasta do projeto no VS Code.
3. Inicie um servidor local, por exemplo, utilizando a extensão **Live Server**.
4. Acesse o endereço informado pelo Live Server, normalmente `http://127.0.0.1:5500`.

Não é necessário instalar dependências nem executar um processo de build.

## Instalação como aplicativo

Em navegadores compatíveis, utilize o botão **Instalar aplicativo**, quando disponível, ou a opção de instalação oferecida pelo próprio navegador.

A disponibilidade do prompt de instalação varia conforme o navegador, o sistema operacional e os critérios de instalação da plataforma.

Em dispositivos iPhone e iPad, quando o prompt automático não estiver disponível, a instalação pode ser realizada pelo menu de compartilhamento do Safari, utilizando a opção **Adicionar à Tela de Início**.

## Recurso de câmera — Foto do Treinador

A aplicação utiliza a câmera do dispositivo como recurso de hardware, permitindo capturar e armazenar uma fotografia localmente.

Para utilizar:

1. Acesse a seção **Foto do Treinador**.
2. Toque em **Abrir câmera** e conceda a permissão solicitada pelo navegador.
3. Toque em **Capturar foto** para registrar a imagem.
4. A fotografia será armazenada no IndexedDB do navegador/dispositivo.
5. Utilize **Remover foto** para apagá-la.

A câmera somente é solicitada após uma ação explícita do usuário. O aplicativo não solicita acesso ao microfone e não envia a fotografia para a PokéAPI ou para outro servidor.

O acesso depende de HTTPS (ou `localhost`) e do suporte do navegador. Limpar os dados do site ou do navegador pode apagar a fotografia armazenada.

## Funcionamento offline

Após uma primeira visita com conexão, o Service Worker armazena os arquivos essenciais da aplicação. Consultas à PokéAPI e imagens carregadas também podem ser armazenadas no cache do navegador.

- A interface principal pode ser aberta offline depois que os arquivos essenciais forem armazenados.
- Pokémon, detalhes e imagens consultados anteriormente podem continuar disponíveis, conforme o conteúdo mantido no cache.
- O catálogo completo não é baixado antecipadamente. Portanto, uma busca por um Pokémon nunca consultado pode não funcionar sem internet.
- O cache é limitado para evitar crescimento indefinido, e o navegador pode remover dados conforme suas políticas de armazenamento.
- O indicador de conexão informa o estado de rede reportado pelo navegador, mas não garante que a PokéAPI esteja disponível.

## API utilizada

A aplicação consome os seguintes endpoints da [PokéAPI](https://pokeapi.co/):

- `GET https://pokeapi.co/api/v2/pokemon?limit=20&offset=0`
- `GET https://pokeapi.co/api/v2/pokemon/{nome-ou-id}`
- `GET https://pokeapi.co/api/v2/type/{tipo}`

## Publicação

A aplicação está publicada por meio do **GitHub Pages**, utilizando **GitHub Actions** para automatizar o processo de implantação.

**Acesse a aplicação:** https://danilohenrique13.github.io/pokedex-pwa/

**Repositório:** https://github.com/danilohenrique13/pokedex-pwa

O workflow de publicação está localizado em `.github/workflows/static.yml` e realiza o envio dos arquivos estáticos da aplicação para o GitHub Pages a partir da branch `main`.

## Validação do projeto

Os recursos da aplicação foram implementados e testados, incluindo:

- Catálogo, pesquisa e filtros de Pokémon.
- Paginação e visualização dos detalhes.
- Responsividade da interface.
- Instalação como PWA.
- Registro e funcionamento do Service Worker.
- Armazenamento de recursos para utilização offline.
- Acesso à câmera e captura de fotografias.
- Persistência e remoção das fotografias utilizando IndexedDB.

## Créditos

- **PokéAPI:** fornecimento dos dados e imagens dos Pokémon — https://pokeapi.co/
- **GitHub:** hospedagem do código-fonte e publicação da aplicação.

Projeto acadêmico desenvolvido na Faculdade SENAC, como parte da disciplina Coding: Mobile.
