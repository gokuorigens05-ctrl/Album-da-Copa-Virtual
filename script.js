const TOTAL_FIGURINHAS = 1000;
const FIGURINHAS_POR_PACOTE = 8;
const PRECO_ENVELOPE = 25;

const botaoAbrir = document.getElementById('btn-abrir');
const botaoReset = document.getElementById('btn-reset');
const botaoComprar = document.getElementById('btn-comprar');
const containerPacote = document.getElementById('pacote-aberto');
const txtPlacar = document.getElementById('placar-progresso');
const txtEnvelopes = document.getElementById('placar-envelopes');
const txtPontos = document.getElementById('placar-pontos');

// --- VARIÁVEIS E COMPONENTES DO ADMIN ---
const SEGREDO_SENHA = "1234"; // 🔑 ALTERE SUA SENHA AQUI SE QUISER!
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
    pontos: 100
};

atualizarPlacar();

function gerarFigurinhaAleatoria() {
    let numeroSorteado = Math.floor(Math.random() * TOTAL_FIGURINHAS) + 1;
    let raridade = "Normal";
    if (numeroSorteado % 50 === 0) raridade = "Lenda";
    return { id: numeroSorteado, nome: `Jogador #${numeroSorteado}`, raridade: raridade };
}

function abrirPacotinho() {
    if (albumSalvo.envelopes <= 0) {
        alert("Você não tem envelopes!");
        return;
    }
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
        albumSalvo = { coladas: [], repetidas: [], envelopes: 5, pontos: 100 };
        localStorage.setItem('meuAlbum', JSON.stringify(albumSalvo));
        containerPacote.innerHTML = "";
        atualizarPlacar();
    }
}

// --- LÓGICA DO MENU DO ADMINISTRADOR ---
btnAdminTrigger.addEventListener('click', () => {
    if (!adminAutenticado) {
        let senhaDigitada = prompt("Digite a senha do Administrador para acessar o painel:");
        if (senhaDigitada === SEGREDO_SENHA) {
            adminAutenticado = true;
            painelAdmin.style.display = "block"; // Abre a janelinha
            alert("Acesso concedido, Chefe!");
        } else {
            alert("Senha incorreta!");
        }
    } else {
        // Se já colocou a senha antes, clicar no botão apenas abre/fecha a janelinhas
        if (painelAdmin.style.display === "block") {
            painelAdmin.style.display = "none";
        } else {
            painelAdmin.style.display = "block";
        }
    }
});

// Botão de dar Envelopes
admAddEnv.addEventListener('click', () => {
    albumSalvo.envelopes += 50;
    localStorage.setItem('meuAlbum', JSON.stringify(albumSalvo));
    atualizarPlacar();
});

// Botão de dar Pontos
admAddPts.addEventListener('click', () => {
    albumSalvo.pontos += 500;
    localStorage.setItem('meuAlbum', JSON.stringify(albumSalvo));
    atualizarPlacar();
});

// Injetar figurinha específica no Álbum
admBtnFig.addEventListener('click', () => {
    let idEscolhido = parseInt(admIdFig.value);
    
    if (isNaN(idEscolhido) || idEscolhido < 1 || idEscolhido > TOTAL_FIGURINHAS) {
        alert("Digite um ID válido entre 1 e 1000!");
        return;
    }

    if (!albumSalvo.coladas.includes(idEscolhido)) {
        albumSalvo.coladas.push(idEscolhido);
        localStorage.setItem('meuAlbum', JSON.stringify(albumSalvo));
        atualizarPlacar();
        alert(`Figurinha #${idEscolhido} adicionada direto no Álbum!`);
    } else {
        alert("Você já tem essa figurinha colada! (Adicionada às repetidas)");
        albumSalvo.repetidas.push(idEscolhido);
        localStorage.setItem('meuAlbum', JSON.stringify(albumSalvo));
        atualizarPlacar();
    }
    admIdFig.value = ""; // Limpa o campo do número
});

botaoAbrir.addEventListener('click', abrirPacotinho);
botaoReset.addEventListener('click', resetarAlbum);
botaoComprar.addEventListener('click', comprarEnvelope);
