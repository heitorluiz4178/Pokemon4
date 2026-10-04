// Pokémon Run - atividade de evolução do jogo
// Controles: Espaço / seta para cima = pular | setas esquerda/direita = mover

const game = document.querySelector("#game");
const player = document.querySelector("#player");
const enemy = document.querySelector("#enemy");
const enemyImg = document.querySelector("#enemyImg");
const pokeball = document.querySelector("#pokeball");

const pontosTexto = document.querySelector("#pontos");
const recordeTexto = document.querySelector("#recorde");
const vidasTexto = document.querySelector("#vidas");
const cenarioNome = document.querySelector("#cenarioNome");
const inimigoNome = document.querySelector("#inimigoNome");
const velocidadeNome = document.querySelector("#velocidadeNome");
const mensagem = document.querySelector("#message");

const startOverlay = document.querySelector("#startOverlay");
const startBtn = document.querySelector("#startBtn");
const restartBtn = document.querySelector("#restartBtn");

let pontos = 0;
let vidas = 3;
let recorde = Number(localStorage.getItem("pokemonRecorde")) || 0;

let jogoRodando = false;
let pulando = false;
let gameLoop;
let ultimoTempo = 0;
let tempoPontuacao = 0;

let playerX = 100;
let enemyX = window.innerWidth;
let pokeballX = window.innerWidth;

let velocidade = 260;

// Cenários: muda a cada 100 pontos
const cenarios = [
  { nome: "Floresta", classe: "", emoji: "🌳" },
  { nome: "Noite", classe: "night", emoji: "🌙" },
  { nome: "Deserto", classe: "desert", emoji: "🏜️" },
  { nome: "Neve", classe: "snow", emoji: "❄️" }
];

// Vilões: muda a cada 200 pontos
const inimigos = [
  {
    nome: "Zubat",
    imagem: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/41.gif"
  },
  {
    nome: "Gastly",
    imagem: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/92.gif"
  },
  {
    nome: "Rattata",
    imagem: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/19.gif"
  },
  {
    nome: "Beedrill",
    imagem: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/15.gif"
  }
];

function atualizarHUD() {
  pontosTexto.textContent = pontos;
  recordeTexto.textContent = recorde;

  let coracoes = "";
  for (let i = 0; i < vidas; i++) {
    coracoes += "❤️";
  }
  vidasTexto.textContent = coracoes || "💀";

  const indiceCenario = Math.floor(pontos / 100) % cenarios.length;
  const cenario = cenarios[indiceCenario];

  game.classList.remove("night", "desert", "snow");
  if (cenario.classe) {
    game.classList.add(cenario.classe);
  }

  cenarioNome.textContent = "Cenário: " + cenario.emoji + " " + cenario.nome;

  const indiceInimigo = Math.floor(pontos / 200) % inimigos.length;
  const inimigoAtual = inimigos[indiceInimigo];

  enemyImg.src = inimigoAtual.imagem;
  enemyImg.alt = inimigoAtual.nome;
  inimigoNome.textContent = "Inimigo: " + inimigoAtual.nome;

  velocidadeNome.textContent = "Velocidade: " + (velocidade / 260).toFixed(1) + "x";
}

function mostrarMensagem(texto) {
  mensagem.textContent = texto;
}

function pular() {
  if (!jogoRodando || pulando) return;

  pulando = true;
  player.classList.remove("jump");
  void player.offsetWidth;
  player.classList.add("jump");

  setTimeout(() => {
    pulando = false;
  }, 650);
}

function moverJogador(direcao) {
  if (!jogoRodando) return;

  playerX += direcao * 35;

  if (playerX < 20) playerX = 20;
  if (playerX > 350) playerX = 350;

  player.style.left = playerX + "px";
}

function reiniciarPosicoes() {
  enemyX = game.clientWidth + 50;
  pokeballX = game.clientWidth + 250;

  enemy.style.left = enemyX + "px";
  enemy.style.right = "auto";

  pokeball.style.left = pokeballX + "px";
  pokeball.style.right = "auto";

  playerX = 100;
  player.style.left = playerX + "px";
}

function colisao(a, b, margem = 12) {
  const rectA = a.getBoundingClientRect();
  const rectB = b.getBoundingClientRect();

  return (
    rectA.left < rectB.right - margem &&
    rectA.right > rectB.left + margem &&
    rectA.top < rectB.bottom - margem &&
    rectA.bottom > rectB.top + margem
  );
}

function perderVida() {
  vidas--;

  player.classList.add("hit");
  setTimeout(() => player.classList.remove("hit"), 300);

  if (vidas <= 0) {
    vidas = 0;
    encerrarJogo();
  } else {
    mostrarMensagem("💥 Você bateu! Cuidado!");
  }

  atualizarHUD();
}

function pegarPokebola() {
  pontos += 25;

  pokeball.classList.add("collect");
  mostrarMensagem("🔴 Pokébola coletada! +25 pontos!");

  setTimeout(() => {
    pokeball.classList.remove("collect");
    pokeballX = game.clientWidth + Math.random() * 500 + 250;
  }, 450);

  verificarRecorde();
  atualizarHUD();
}

function verificarRecorde() {
  if (pontos > recorde) {
    recorde = pontos;
    localStorage.setItem("pokemonRecorde", recorde);
  }
}

function aumentarDificuldade() {
  // A velocidade aumenta gradualmente para deixar o jogo mais difícil.
  velocidade = 260 + Math.floor(pontos / 100) * 22;
  atualizarHUD();
}

function atualizarJogo(delta) {
  if (!jogoRodando) return;

  enemyX -= velocidade * delta / 1000;
  pokeballX -= velocidade * 0.72 * delta / 1000;

  if (enemyX < -90) {
    enemyX = game.clientWidth + Math.random() * 220;
  }

  if (pokeballX < -50) {
    pokeballX = game.clientWidth + 300 + Math.random() * 450;
  }

  enemy.style.left = enemyX + "px";
  pokeball.style.left = pokeballX + "px";

  if (colisao(player, enemy, 18)) {
    perderVida();
    enemyX = game.clientWidth + 250;
  }

  if (colisao(player, pokeball, 8)) {
    pegarPokebola();
    pokeballX = game.clientWidth + 350;
  }

  tempoPontuacao += delta;

  // 1 ponto a cada aproximadamente 100 ms.
  if (tempoPontuacao >= 100) {
    pontos += Math.floor(tempoPontuacao / 100);
    tempoPontuacao %= 100;

    verificarRecorde();
    aumentarDificuldade();
    atualizarHUD();
  }
}

function loop(tempoAtual) {
  if (!jogoRodando) return;

  if (!ultimoTempo) ultimoTempo = tempoAtual;

  const delta = Math.min(tempoAtual - ultimoTempo, 50);
  ultimoTempo = tempoAtual;

  atualizarJogo(delta);
  gameLoop = requestAnimationFrame(loop);
}

function iniciarJogo() {
  cancelarAnimationFrameSeguro();

  pontos = 0;
  vidas = 3;
  velocidade = 260;
  tempoPontuacao = 0;
  ultimoTempo = 0;

  startOverlay.style.display = "none";
  jogoRodando = true;

  reiniciarPosicoes();
  atualizarHUD();
  mostrarMensagem("🏃 Corra! Pule os inimigos e pegue as Pokébolas!");

  gameLoop = requestAnimationFrame(loop);
}

function cancelarAnimationFrameSeguro() {
  if (gameLoop) {
    cancelAnimationFrame(gameLoop);
  }
}

function encerrarJogo() {
  jogoRodando = false;
  cancelarAnimationFrameSeguro();

  verificarRecorde();
  atualizarHUD();

  startOverlay.style.display = "grid";
  startOverlay.querySelector("h2").textContent = "💥 Fim de jogo!";
  startOverlay.querySelector("p").textContent =
    "Pontuação: " + pontos + " | Recorde: " + recorde;

  startBtn.textContent = "JOGAR NOVAMENTE";
  mostrarMensagem("🏆 Tente superar seu recorde!");
}

document.addEventListener("keydown", (event) => {
  if (event.code === "Space" || event.code === "ArrowUp") {
    event.preventDefault();

    if (!jogoRodando) {
      iniciarJogo();
    } else {
      pular();
    }
  }

  if (event.code === "ArrowLeft") {
    event.preventDefault();
    moverJogador(-1);
  }

  if (event.code === "ArrowRight") {
    event.preventDefault();
    moverJogador(1);
  }
});

startBtn.addEventListener("click", iniciarJogo);
restartBtn.addEventListener("click", iniciarJogo);

window.addEventListener("resize", () => {
  if (playerX > 350) playerX = 350;
});

atualizarHUD();
