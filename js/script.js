const API_URL = "https://pokeapi.co/api/v2";
const PAGE_SIZE = 20;

const grid = document.querySelector("#pokemon-grid");
const stateMessage = document.querySelector("#state-message");
const resultsLabel = document.querySelector("#results-label");
const countLabel = document.querySelector("#pokemon-count");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const typeFilter = document.querySelector("#type-filter");
const loadMoreButton = document.querySelector("#load-more");
const dialog = document.querySelector("#pokemon-dialog");
const dialogContent = document.querySelector("#dialog-content");
const dialogClose = document.querySelector("#dialog-close");

let nextOffset = 0;
let currentType = "all";
let isLoading = false;
let requestVersion = 0;
let activeController = null;

const typeNames = {
  normal: "Normal", fire: "Fogo", water: "Água", electric: "Elétrico",
  grass: "Planta", ice: "Gelo", fighting: "Lutador", poison: "Veneno",
  ground: "Terra", flying: "Voador", psychic: "Psíquico", bug: "Inseto",
  rock: "Pedra", ghost: "Fantasma", dragon: "Dragão", dark: "Sombrio",
  steel: "Aço", fairy: "Fada"
};

const statNames = {
  hp: "HP", attack: "Ataque", defense: "Defesa",
  "special-attack": "Atq. especial", "special-defense": "Def. especial",
  speed: "Velocidade"
};

function getArtwork(pokemon) {
  return pokemon.sprites.other?.["official-artwork"]?.front_default
    || pokemon.sprites.front_default
    || "";
}

function setMessage(message, loading = false) {
  stateMessage.replaceChildren();
  if (!message) return;
  if (loading) {
    const spinner = document.createElement("span");
    spinner.className = "loader";
    spinner.setAttribute("aria-hidden", "true");
    stateMessage.append(spinner);
  }
  const text = document.createElement("span");
  text.textContent = message;
  stateMessage.append(text);
}

function formatNumber(number) {
  return `#${String(number).padStart(4, "0")}`;
}

function createPokemonCard(pokemon) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "pokemon-card";
  button.setAttribute("aria-label", `Ver detalhes de ${pokemon.name}`);

  const top = document.createElement("div");
  top.className = "card-top";
  const number = document.createElement("span");
  number.className = "pokemon-number";
  number.textContent = formatNumber(pokemon.id);
  const type = document.createElement("span");
  type.className = "card-type";
  const primaryType = pokemon.types[0]?.type.name || "unknown";
  type.textContent = typeNames[primaryType] || primaryType;
  top.append(number, type);

  const art = document.createElement("div");
  art.className = "pokemon-art";
  const image = document.createElement("img");
  const artwork = getArtwork(pokemon);
  const fallbackArtwork = pokemon.sprites.front_default || "";
  image.alt = `Ilustração de ${pokemon.name}`;
  image.loading = "lazy";
  image.decoding = "async";
  image.width = 140;
  image.height = 140;
  image.onerror = () => {
    image.onerror = null;
    if (fallbackArtwork && image.src !== fallbackArtwork) image.src = fallbackArtwork;
    else image.hidden = true;
  };
  if (artwork) image.src = artwork;
  else if (fallbackArtwork) image.src = fallbackArtwork;
  else image.hidden = true;
  art.append(image);

  const name = document.createElement("h3");
  name.className = "card-name";
  name.textContent = pokemon.name;
  const caption = document.createElement("p");
  caption.className = "card-caption";
  caption.textContent = pokemon.types.map(item => typeNames[item.type.name] || item.type.name).join(" / ");

  button.append(top, art, name, caption);
  button.addEventListener("click", () => showDetails(pokemon));
  return button;
}

function renderPokemon(pokemonList, append = false) {
  if (!append) grid.replaceChildren();
  const fragment = document.createDocumentFragment();
  pokemonList.forEach(pokemon => fragment.append(createPokemonCard(pokemon)));
  grid.append(fragment);
  grid.setAttribute("aria-busy", "false");
}

async function fetchJson(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Falha HTTP ${response.status}`);
  return response.json();
}

function startRequest() {
  activeController?.abort();
  activeController = new AbortController();
  requestVersion += 1;
  return { version: requestVersion, signal: activeController.signal };
}

async function loadPokemon({ append = false } = {}) {
  if (append && isLoading) return;
  const { version, signal } = startRequest();
  isLoading = true;
  loadMoreButton.hidden = true;
  setMessage(append ? "Carregando mais Pokémon…" : "Buscando Pokémon…", true);
  grid.setAttribute("aria-busy", "true");

  try {
    let pokemonList = [];
    let total = 0;

    if (currentType === "all") {
      const data = await fetchJson(`${API_URL}/pokemon?limit=${PAGE_SIZE}&offset=${nextOffset}`, signal);
      total = data.count;
      pokemonList = await Promise.all(data.results.map(item => fetchJson(item.url, signal)));
    } else {
      const data = await fetchJson(`${API_URL}/type/${currentType}`, signal);
      const entries = data.pokemon
        .map(item => item.pokemon)
        .filter(item => !item.url.includes("-mega") && !item.url.includes("-gmax"));
      total = entries.length;
      const page = entries.slice(nextOffset, nextOffset + PAGE_SIZE);
      pokemonList = await Promise.all(page.map(item => fetchJson(item.url, signal)));
    }

    if (version !== requestVersion) return;
    nextOffset += pokemonList.length;
    countLabel.textContent = total.toLocaleString("pt-BR");
    loadMoreButton.hidden = nextOffset >= total || pokemonList.length === 0;
    loadMoreButton.textContent = "Carregar mais Pokémon ↓";
    renderPokemon(pokemonList, append);
    setMessage(pokemonList.length ? "" : "Nenhum Pokémon encontrado.");
    const shown = grid.children.length;
    resultsLabel.textContent = `${shown} de ${total} Pokémon`;
  } catch (error) {
    if (error.name === "AbortError" || version !== requestVersion) return;
    setMessage(navigator.onLine
      ? "Não foi possível carregar os dados. Tente novamente em instantes."
      : "Você está offline. Só é possível consultar dados que já foram carregados e armazenados neste aparelho.");
    if (append && grid.children.length) {
      loadMoreButton.hidden = false;
      loadMoreButton.textContent = "Tentar carregar novamente ↻";
    }
    grid.setAttribute("aria-busy", "false");
    console.error("Erro ao carregar Pokémon:", error);
  } finally {
    if (version === requestVersion) {
      isLoading = false;
      activeController = null;
    }
  }
}

async function searchPokemon(event) {
  event?.preventDefault();
  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    resetAndLoad();
    return;
  }

  const { version, signal } = startRequest();
  isLoading = true;
  loadMoreButton.hidden = true;
  grid.replaceChildren();
  grid.setAttribute("aria-busy", "true");
  setMessage("Pesquisando Pokémon…", true);
  resultsLabel.textContent = "Resultado da pesquisa";

  try {
    const pokemon = await fetchJson(`${API_URL}/pokemon/${encodeURIComponent(query)}`, signal);
    if (version !== requestVersion) return;
    renderPokemon([pokemon]);
    setMessage("");
    countLabel.textContent = "1";
    resultsLabel.textContent = "1 resultado encontrado";
  } catch (error) {
    if (error.name === "AbortError" || version !== requestVersion) return;
    setMessage(error.message.includes("HTTP 404")
      ? `Não encontramos um Pokémon chamado "${query}".`
      : navigator.onLine
        ? "Erro ao pesquisar. Verifique o nome ou número e tente novamente."
        : "Você está offline. Essa pesquisa depende de dados que talvez ainda não estejam armazenados neste aparelho.");
    grid.setAttribute("aria-busy", "false");
    countLabel.textContent = "—";
    console.error("Erro na pesquisa:", error);
  } finally {
    if (version === requestVersion) {
      isLoading = false;
      activeController = null;
    }
  }
}

function resetAndLoad() {
  nextOffset = 0;
  loadPokemon();
}

function changeType(type) {
  currentType = type;
  typeFilter.value = type;
  document.querySelectorAll(".type-chip").forEach(button => {
    const active = button.dataset.type === type;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  searchInput.value = "";
  resetAndLoad();
}

function showDetails(pokemon) {
  dialogContent.replaceChildren();

  const hero = document.createElement("div");
  hero.className = "detail-hero";
  const number = document.createElement("span");
  number.className = "detail-number";
  number.textContent = formatNumber(pokemon.id);
  const image = document.createElement("img");
  image.src = getArtwork(pokemon);
  image.alt = `Ilustração de ${pokemon.name}`;
  image.loading = "eager";
  image.decoding = "async";
  const name = document.createElement("h2");
  name.id = "dialog-name";
  name.textContent = pokemon.name;
  const types = document.createElement("div");
  types.className = "detail-types";
  pokemon.types.forEach(item => {
    const badge = document.createElement("span");
    badge.className = "card-type";
    badge.textContent = typeNames[item.type.name] || item.type.name;
    types.append(badge);
  });
  hero.append(number, image, name, types);

  const content = document.createElement("div");
  content.className = "detail-content";
  const facts = document.createElement("div");
  facts.className = "detail-facts";
  const height = document.createElement("div");
  height.className = "fact";
  const heightLabel = document.createElement("span");
  heightLabel.textContent = "Altura";
  const heightValue = document.createElement("strong");
  heightValue.textContent = `${(pokemon.height / 10).toFixed(1)} m`;
  height.append(heightLabel, heightValue);
  const weight = document.createElement("div");
  weight.className = "fact";
  const weightLabel = document.createElement("span");
  weightLabel.textContent = "Peso";
  const weightValue = document.createElement("strong");
  weightValue.textContent = `${(pokemon.weight / 10).toFixed(1)} kg`;
  weight.append(weightLabel, weightValue);
  facts.append(height, weight);

  const statsTitle = document.createElement("h3");
  statsTitle.textContent = "Estatísticas base";
  const stats = document.createElement("div");
  pokemon.stats.forEach(item => {
    const row = document.createElement("div");
    row.className = "stat-row";
    const label = document.createElement("span");
    label.className = "stat-name";
    label.textContent = statNames[item.stat.name] || item.stat.name;
    const value = document.createElement("span");
    value.className = "stat-value";
    value.textContent = item.base_stat;
    const track = document.createElement("div");
    track.className = "stat-track";
    const fill = document.createElement("div");
    fill.className = "stat-fill";
    fill.style.width = `${Math.min(item.base_stat / 180 * 100, 100)}%`;
    track.append(fill);
    row.append(label, value, track);
    stats.append(row);
  });

  const abilitiesTitle = document.createElement("h3");
  abilitiesTitle.textContent = "Habilidades";
  const abilities = document.createElement("p");
  abilities.className = "detail-abilities";
  abilities.textContent = pokemon.abilities.map(item => item.ability.name.replaceAll("-", " ")).join(" • ");
  content.append(facts, statsTitle, stats, abilitiesTitle, abilities);
  dialogContent.append(hero, content);
  if (!dialog.open) dialog.showModal();
}

searchForm.addEventListener("submit", searchPokemon);
typeFilter.addEventListener("change", event => changeType(event.target.value));
document.querySelectorAll(".type-chip").forEach(button => {
  button.addEventListener("click", () => changeType(button.dataset.type));
});
loadMoreButton.addEventListener("click", () => loadPokemon({ append: true }));
dialogClose.addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => {
  if (event.target === dialog) dialog.close();
});

// Instalação do PWA: o navegador só oferece o prompt em plataformas compatíveis.
let installPromptEvent = null;
const installButton = document.querySelector("#install-button");
window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  installPromptEvent = event;
  installButton.hidden = false;
});
installButton.addEventListener("click", async () => {
  if (!installPromptEvent) return;
  installButton.disabled = true;
  try {
    await installPromptEvent.prompt();
    await installPromptEvent.userChoice;
  } catch (error) {
    console.warn("O processo de instalação foi interrompido.", error);
  } finally {
    installPromptEvent = null;
    installButton.hidden = true;
    installButton.disabled = false;
  }
});
window.addEventListener("appinstalled", () => {
  installPromptEvent = null;
  installButton.hidden = true;
});

// Indicador de conectividade. A disponibilidade da rede não garante que a API esteja acessível.
const connectionStatus = document.querySelector("#connection-status");
function updateConnectionStatus() {
  const online = navigator.onLine;
  connectionStatus.textContent = online
    ? "Conexão de rede disponível"
    : "Sem conexão — conteúdo previamente armazenado pode continuar disponível";
  connectionStatus.classList.toggle("offline", !online);
}
window.addEventListener("online", updateConnectionStatus);
window.addEventListener("offline", updateConnectionStatus);
updateConnectionStatus();

// Câmera: só é solicitada após ação explícita e todas as trilhas são encerradas ao sair.
const cameraVideo = document.querySelector("#camera-video");
const cameraCanvas = document.querySelector("#camera-canvas");
const cameraStart = document.querySelector("#camera-start");
const cameraCapture = document.querySelector("#camera-capture");
const cameraStop = document.querySelector("#camera-stop");
const cameraMessage = document.querySelector("#camera-message");
const cameraPlaceholder = document.querySelector("#camera-placeholder");
const photoResult = document.querySelector("#photo-result");
const savedPhoto = document.querySelector("#saved-photo");
const photoRemove = document.querySelector("#photo-remove");
const PHOTO_DB_NAME = "pokedex-local-data";
const PHOTO_STORE_NAME = "photos";
const PHOTO_KEY = "trainer";
let cameraStream = null;
let savedPhotoBlob = null;
let savedPhotoUrl = null;
let photoDatabasePromise = null;

function openPhotoDatabase() {
  if (!("indexedDB" in window)) return Promise.reject(new Error("IndexedDB não está disponível neste navegador."));
  if (!photoDatabasePromise) {
    photoDatabasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(PHOTO_DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(PHOTO_STORE_NAME)) {
          request.result.createObjectStore(PHOTO_STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Não foi possível abrir o armazenamento local."));
      request.onblocked = () => reject(new Error("O armazenamento local está ocupado por outra aba."));
    }).catch(error => {
      photoDatabasePromise = null;
      throw error;
    });
  }
  return photoDatabasePromise;
}

async function storePhoto(blob) {
  const database = await openPhotoDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(PHOTO_STORE_NAME, "readwrite");
    transaction.objectStore(PHOTO_STORE_NAME).put(blob, PHOTO_KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("Falha ao salvar a foto."));
    transaction.onabort = () => reject(transaction.error || new Error("O salvamento da foto foi cancelado."));
  });
}

async function readPhoto() {
  const database = await openPhotoDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(PHOTO_STORE_NAME, "readonly");
    const request = transaction.objectStore(PHOTO_STORE_NAME).get(PHOTO_KEY);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error("Falha ao recuperar a foto."));
  });
}

async function deletePhoto() {
  const database = await openPhotoDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(PHOTO_STORE_NAME, "readwrite");
    transaction.objectStore(PHOTO_STORE_NAME).delete(PHOTO_KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("Falha ao remover a foto."));
  });
}

function displaySavedPhoto(blob) {
  savedPhotoBlob = blob;
  if (savedPhotoUrl) URL.revokeObjectURL(savedPhotoUrl);
  savedPhotoUrl = URL.createObjectURL(blob);
  savedPhoto.src = savedPhotoUrl;
  photoResult.hidden = false;
  cameraPlaceholder.hidden = true;
}

async function showSavedPhoto() {
  try {
    const photo = await readPhoto();
    if (photo) displaySavedPhoto(photo);
  } catch (error) {
    cameraMessage.textContent = "O armazenamento local de fotos não está disponível neste navegador.";
    console.warn("Não foi possível recuperar a foto salva.", error);
  }
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
  cameraVideo.srcObject = null;
  cameraVideo.hidden = true;
  cameraCapture.disabled = true;
  cameraStop.disabled = true;
  cameraStart.disabled = false;
  if (savedPhotoBlob) displaySavedPhoto(savedPhotoBlob);
  else {
    photoResult.hidden = true;
    cameraPlaceholder.hidden = false;
  }
}

cameraStart.addEventListener("click", async () => {
  if (!navigator.mediaDevices?.getUserMedia) {
    cameraMessage.textContent = "Este navegador não oferece acesso à câmera. Use um navegador atualizado em HTTPS ou localhost.";
    return;
  }
  cameraStart.disabled = true;
  cameraMessage.textContent = "Aguardando permissão para acessar a câmera…";
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: { ideal: "user" }, width: { ideal: 1280 }, height: { ideal: 720 } }
    });
    cameraVideo.srcObject = cameraStream;
    cameraVideo.hidden = false;
    cameraPlaceholder.hidden = true;
    photoResult.hidden = true;
    cameraCapture.disabled = false;
    cameraStop.disabled = false;
    cameraMessage.textContent = "Câmera ativa. Posicione-se e toque em “Capturar foto”.";
    await cameraVideo.play();
  } catch (error) {
    stopCamera();
    const messages = {
      NotAllowedError: "A permissão da câmera foi negada. Autorize o acesso nas configurações do navegador.",
      NotFoundError: "Nenhuma câmera foi encontrada neste dispositivo.",
      NotReadableError: "A câmera está sendo usada por outro aplicativo.",
      SecurityError: "O navegador bloqueou a câmera. Acesse a aplicação por HTTPS ou localhost."
    };
    cameraMessage.textContent = messages[error.name] || "Não foi possível abrir a câmera. Verifique a permissão e tente novamente.";
    console.error("Erro ao acessar a câmera:", error);
  }
});

cameraCapture.addEventListener("click", async () => {
  if (!cameraStream || !cameraVideo.videoWidth) {
    cameraMessage.textContent = "Aguarde a imagem da câmera aparecer antes de capturar.";
    return;
  }
  cameraCapture.disabled = true;
  const maxWidth = 1280;
  const scale = Math.min(1, maxWidth / cameraVideo.videoWidth);
  cameraCanvas.width = Math.round(cameraVideo.videoWidth * scale);
  cameraCanvas.height = Math.round(cameraVideo.videoHeight * scale);
  const context = cameraCanvas.getContext("2d");
  if (!context) {
    cameraCapture.disabled = false;
    cameraMessage.textContent = "Não foi possível preparar a captura neste navegador.";
    return;
  }
  context.drawImage(cameraVideo, 0, 0, cameraCanvas.width, cameraCanvas.height);
  cameraCanvas.toBlob(async blob => {
    if (!blob) {
      cameraCapture.disabled = false;
      cameraMessage.textContent = "Não foi possível gerar a fotografia. Tente novamente.";
      return;
    }
    try {
      await storePhoto(blob);
      displaySavedPhoto(blob);
      cameraMessage.textContent = "Foto salva neste dispositivo. Ela não é enviada para nenhum servidor.";
      stopCamera();
    } catch (error) {
      cameraCapture.disabled = false;
      cameraMessage.textContent = "Não foi possível salvar a foto. Verifique o espaço disponível no navegador.";
      console.error("Erro ao salvar a foto:", error);
    }
  }, "image/jpeg", 0.82);
});

cameraStop.addEventListener("click", () => {
  stopCamera();
  cameraMessage.textContent = "Câmera fechada.";
});

photoRemove.addEventListener("click", async () => {
  photoRemove.disabled = true;
  try {
    await deletePhoto();
    savedPhotoBlob = null;
    if (savedPhotoUrl) URL.revokeObjectURL(savedPhotoUrl);
    savedPhotoUrl = null;
    savedPhoto.removeAttribute("src");
    photoResult.hidden = true;
    cameraPlaceholder.hidden = false;
    cameraMessage.textContent = "Foto removida deste dispositivo.";
  } catch (error) {
    cameraMessage.textContent = "Não foi possível remover a foto do armazenamento local.";
    console.error("Erro ao remover a foto:", error);
  } finally {
    photoRemove.disabled = false;
  }
});

window.addEventListener("pagehide", () => {
  stopCamera();
  if (savedPhotoUrl) {
    URL.revokeObjectURL(savedPhotoUrl);
    savedPhotoUrl = null;
  }
});
window.addEventListener("pageshow", () => {
  if (savedPhotoBlob && !savedPhotoUrl) displaySavedPhoto(savedPhotoBlob);
});

showSavedPhoto();
loadPokemon();
