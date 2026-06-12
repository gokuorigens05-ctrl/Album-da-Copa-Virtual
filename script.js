const TOTAL_FIGURINHAS = 1000;
const FIGURINHAS_POR_PACOTE = 8;
const PRECO_ENVELOPE = 25;

const botaoAbrir = document.getElementById('btn-abrir');
const botaoReset = document.getElementById('btn-reset');
const botaoComprar = document.getElementById('btn-comprar');
const botaoDiario = document.getElementById('btn-diario'); // Novo botão
const containerPacote = document.getElementById('pacote-aberto');
const txtPlacar = document.getElementById('placar-progresso');
const txtEnvelopes = document.getElementById('placar-envelopes');
const txtPontos = document.getElementById('placar-pontos');

const SEGREDO_SENHA = "1234";
let adminAutenticado = false;
const btnAdminTrigger = document.getElementById('btn-admin-trigger');
const painelAdmin = document.getElementById('painel-admin');
const admAddEnv = document.getElementById('adm-add-env');
const admAddPts = document.getElementById('adm-add-pts');
const admIdFig = document.getElementById('adm-id-fig');
const admBtnFig = document.getElementById('adm-btn-fig');

let albumSalvo = JSON.parse(localStorage.getItem('meuAlbum')) || {
    coladas: [],
    repetidas: [],
    envelopes: 5,
    pontos: 100,
    ultimaColeta: null // Salva o carimbo de data/hora do último resgate
};

atualizarPlacar();
verificarTempoDiario();
// Executa a contagem regressiva a cada 1 segundo continuamente
setInterval(verificarTempoDiario, 1000);

function gerarFigurinhaAleatoria() {
    let numeroSorteado = Math.floor(Math.random() * TOTAL_FIGURINHAS) + 1;
    let raridade = "Normal";
    if (numeroSorteado % 50 === 0) raridade = "Lenda";
    return { id: numeroSorteado, nome: `Jogador #${numeroSorteado}`, raridade: raridade };
}

function abrirPacotinho() {
    if (albumSalvo.envelopes <= 0) return;
    albumSalvo.envelopes--;
    containerPacote.innerHTML = "";
    
    for (let i = 0; i < FIGURINHAS_POR_PACOTE; i++) {
        let figurinha = gerarFigurinhaAleatoria();
        let statusTexto = "";
        
        if (!albumSalvo.coladas.includes(figurinha.id)) {
            albumSalvo.coladas.push(figurinha.id);
            statusTexto = "<b style='color: green;'>¡NOVA!</b>";
            albumSalvo.pontos += 2;
        } else {
            albumSalvo.repetidas.push(figurinha.id);
            statusTexto = "<b style='color: orange;'>REPETIDA</b>";
            albumSalvo.pontos += 1;
        }
        
        let card = document.createElement('div');
        card.classList.add('figurinha-card');
        if (figurinha.raridade === "Lenda") card.classList.add('Lenda');
        
        card.innerHTML = `
            <span style="font-size: 20px;">${figurinha.raridade === "Lenda" ? "🌟" : "⚽"}</span>
            <h4 style="margin: 5px 0;">${figurinha.nome}</h4>
            <p style="margin: 0; color: #777; font-size: 12px;">ID: ${figurinha.id}</p>
            <p style="margin: 5px 0 0 0; font-size: 11px;">${statusTexto}</p>
        `;
        containerPacote.appendChild(card);
    }
    localStorage.setItem('meuAlbum', JSON.stringify(albumSalvo));
    atualizarPlacar();
}

function comprarEnvelope() {
    if (albumSalvo.pontos >= PRECO_ENVELOPE) {
        albumSalvo.pontos -= PRECO_ENVELOPE;
        albumSalvo.envelopes++;
        localStorage.setItem('meuAlbum', JSON.stringify(albumSalvo));
        atualizarPlacar();
    }
}

// --- LÓGICA DO TEMPO REAL (24 HORAS) ---
function verificarTempoDiario() {
    if (!albumSalvo.ultimaColeta) {
        botaoDiario.disabled = false;
        botaoDiario.innerText = "Coletar Envelopes Diários 🎁";
        return;
    }

    const agora = new Date().getTime();
    const tempoPassado = agora - albumSalvo.ultimaColeta;
    const vinteQuatroHoras = 24 * 60 * 60 * 1000; // Tempo em milissegundos

    if (tempoPassado >= vinteQuatroHoras) {
        botaoDiario.disabled = false;
        botaoDiario.innerText = "Coletar Envelopes Diários 🎁";
    } else {
        botaoDiario.disabled = true;
        // Calcula quanto tempo falta
        const tempoRestante = vinteQuatroHoras - tempoPassado;
        const horas = Math.floor(tempoRestante / (1000 * 60 * 60));
        const minutos = Math.floor((tempoRestante % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((tempoRestante % (1000 * 60)) / 1000);
        
        botaoDiario.innerText = `Próximo pacote em: ${horas}h ${minutos}m ${segundos}s`;
    }
}

function coletarDiario() {
    albumSalvo.envelopes += 5; // Recompensa diária
    albumSalvo.ultimaColeta = new Date().getTime(); // Salva o momento exato do clique
    
    localStorage.setItem('meuAlbum', JSON.stringify(albumSalvo));
    atualizarPlacar();
    verificarTempoDiario();
    alert("Você coletou seus 5 envelopes diários de presente! Volte amanhã.");
}

function atualizarPlacar() {
    let totalColadas = albumSalvo.coladas.length;
    let porcentagem = ((totalColadas / TOTAL_FIGURINHAS) * 100).toFixed(1);
    txtPlacar.innerText = `Progresso: ${totalColadas} / ${TOTAL_FIGURINHAS} (${porcentagem}%) | Repetidas: ${albumSalvo.repetidas.length}`;
    txtEnvelopes.innerText = `✉️ Envelopes: ${albumSalvo.envelopes}`;
    txtPontos.innerText = `🪙 Pontos: ${albumSalvo.pontos}`;
    botaoAbrir.disabled = albumSalvo.envelopes <= 0;
    botaoComprar.disabled = albumSalvo.pontos < PRECO_ENVELOPE;
}

function resetarAlbum() {
    if (confirm("Tem certeza que deseja resetar todo o seu álbum?")) {
        albumSalvo = { coladas: [], repetidas: [], envelopes: 5, pontos: 100, ultimaColeta: null };
        localStorage.setItem('meuAlbum', JSON.stringify(albumSalvo));
        containerPacote.innerHTML = "";
        atualizarPlacar();
        verificarTempoDiario();
    }
}

// Ouvintes do Admin
btnAdminTrigger.addEventListener('click', () => {
    if (!adminAutenticado) {
        if (prompt("Digite a senha:") === SEGREDO_SENHA) {
            adminAutenticado = true; painelAdmin.style.display = "block";
        }
    } else {
        painelAdmin.style.display = painelAdmin.style.display === "block" ? "none" : "block";
    }
});
admAddEnv.addEventListener('click', () => { albumSalvo.envelopes += 50; localStorage.setItem('meuAlbum', JSON.stringify(albumSalvo)); atualizarPlacar(); });
admAddPts.addEventListener('click', () => { albumSalvo.pontos += 500; localStorage.setItem('meuAlbum', JSON.stringify(albumSalvo)); atualizarPlacar(); });
admBtnFig.addEventListener('click', () => {
    let id = parseInt(admIdFig.value);
    if (isNaN(id) || id < 1 || id > TOTAL_FIGURINHAS) return;
    if (!albumSalvo.coladas.includes(id)) albumSalvo.coladas.push(id);
    else albumSalvo.repetidas.push(id);
    localStorage.setItem('meuAlbum', JSON.stringify(albumSalvo));
    atualizarPlacar();
    admIdFig.value = "";
});

botaoAbrir.addEventListener('click', abrirPacotinho);
botaoReset.addEventListener('click', resetarAlbum);
botaoComprar.addEventListener('click', comprarEnvelope);
botaoDiario.addEventListener('click', coletarDiario); // Ouvinte do botão diário
