const TOTAL_FIGURINHAS = 1000;
const FIGURINHAS_POR_PACOTE = 8;
const PRECO_ENVELOPE = 25; // Custo em pontos

const botaoAbrir = document.getElementById('btn-abrir');
const botaoReset = document.getElementById('btn-reset');
const botaoComprar = document.getElementById('btn-comprar'); // Novo botão
const containerPacote = document.getElementById('pacote-aberto');
const txtPlacar = document.getElementById('placar-progresso');
const txtEnvelopes = document.getElementById('placar-envelopes'); // Novo texto
const txtPontos = document.getElementById('placar-pontos'); // Novo texto

// Atualizamos a estrutura do banco local para aceitar envelopes e pontos
let albumSalvo = JSON.parse(localStorage.getItem('meuAlbum')) || {
    coladas: [],
    repetidas: [],
    envelopes: 5,  // Começa com 5 grátis
    pontos: 100    // Começa com 100 moedas
};

atualizarPlacar();

function gerarFigurinhaAleatoria() {
    let numeroSorteado = Math.floor(Math.random() * TOTAL_FIGURINHAS) + 1;
    let raridade = "Normal";
    if (numeroSorteado % 50 === 0) {
        raridade = "Lenda";
    }
    return { id: numeroSorteado, nome: `Jogador #${numeroSorteado}`, raridade: raridade };
}

function abrirPacotinho() {
    // SE NÃO TIVER ENVELOPES, NÃO DEIXA ABRIR
    if (albumSalvo.envelopes <= 0) {
        alert("Você não tem envelopes! Compre mais na lojinha ou aguarde as 24h.");
        return;
    }

    // Gasta 1 envelope
    albumSalvo.envelopes--;
    containerPacote.innerHTML = "";
    
    for (let i = 0; i < FIGURINHAS_POR_PACOTE; i++) {
        let figurinha = gerarFigurinhaAleatoria();
        let statusTexto = "";
        
        if (!albumSalvo.coladas.includes(figurinha.id)) {
            albumSalvo.coladas.push(figurinha.id);
            statusTexto = "<b style='color: green;'>¡NOVA!</b>";
            // Ganha 2 pontos por colar uma figurinha nova!
            albumSalvo.pontos += 2;
        } else {
            albumSalvo.repetidas.push(figurinha.id);
            statusTexto = "<b style='color: orange;'>REPETIDA</b>";
            // Ganha 1 ponto mesmo se for repetida, para ajudar a comprar mais
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

// --- FUNÇÃO DA LOJINHA ---
function comprarEnvelope() {
    if (albumSalvo.pontos >= PRECO_ENVELOPE) {
        albumSalvo.pontos -= PRECO_ENVELOPE; // Gasta os pontos
        albumSalvo.envelopes++; // Adiciona o envelope
        
        localStorage.setItem('meuAlbum', JSON.stringify(albumSalvo));
        atualizarPlacar();
    } else {
        alert("Pontos insuficientes para comprar um envelope!");
    }
}

function atualizarPlacar() {
    let totalColadas = albumSalvo.coladas.length;
    let porcentagem = ((totalColadas / TOTAL_FIGURINHAS) * 100).toFixed(1);
    
    txtPlacar.innerText = `Progresso: ${totalColadas} / ${TOTAL_FIGURINHAS} (${porcentagem}%) | Repetidas: ${albumSalvo.repetidas.length}`;
    
    // Atualiza os novos textos de economia na tela
    txtEnvelopes.innerText = `✉️ Envelopes: ${albumSalvo.envelopes}`;
    txtPontos.innerText = `🪙 Pontos: ${albumSalvo.pontos}`;

    // Desativa os botões caso o usuário não tenha recursos (evita cliques errados)
    botaoAbrir.disabled = albumSalvo.envelopes <= 0;
    botaoComprar.disabled = albumSalvo.pontos < PRECO_ENVELOPE;
}

function resetarAlbum() {
    let certeza = confirm("Tem certeza que deseja resetar todo o seu álbum?");
    if (certeza) {
        albumSalvo = {
            coladas: [],
            repetidas: [],
            envelopes: 5,  // Reseta para os valores iniciais
            pontos: 100
        };
        localStorage.setItem('meuAlbum', JSON.stringify(albumSalvo));
        containerPacote.innerHTML = "";
        atualizarPlacar();
    }
}

botaoAbrir.addEventListener('click', abrirPacotinho);
botaoReset.addEventListener('click', resetarAlbum);
botaoComprar.addEventListener('click', comprarEnvelope); // Ouvinte da lojinha
