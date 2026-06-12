const TOTAL_FIGURINHAS = 1000;
const FIGURINHAS_POR_PACOTE = 8;

const botaoAbrir = document.getElementById('btn-abrir');
const botaoReset = document.getElementById('btn-reset'); // Novo botão
const containerPacote = document.getElementById('pacote-aberto');
const txtPlacar = document.getElementById('placar-progresso');

let albumSalvo = JSON.parse(localStorage.getItem('meuAlbum')) || {
    coladas: [],
    repetidas: []
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
    containerPacote.innerHTML = "";
    
    for (let i = 0; i < FIGURINHAS_POR_PACOTE; i++) {
        let figurinha = gerarFigurinhaAleatoria();
        let statusTexto = "";
        
        if (!albumSalvo.coladas.includes(figurinha.id)) {
            albumSalvo.coladas.push(figurinha.id);
            statusTexto = "<b style='color: green;'>¡NOVA!</b>";
        } else {
            albumSalvo.repetidas.push(figurinha.id);
            statusTexto = "<b style='color: orange;'>REPETIDA</b>";
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

function atualizarPlacar() {
    let totalColadas = albumSalvo.coladas.length;
    let porcentagem = ((totalColadas / TOTAL_FIGURINHAS) * 100).toFixed(1);
    txtPlacar.innerText = `Progresso: ${totalColadas} / ${TOTAL_FIGURINHAS} (${porcentagem}%) | Repetidas na sacola: ${albumSalvo.repetidas.length}`;
}

// --- FUNÇÃO DE RESETAR O ÁLBUM ---
function resetarAlbum() {
    // Abre um aviso na tela para confirmar a ação
    let certeza = confirm("Tem certeza que deseja resetar todo o seu álbum? Você perderá todas as suas figurinhas!");
    
    if (certeza) {
        // Limpa as listas na memória
        albumSalvo = {
            coladas: [],
            repetidas: []
        };
        
        // Salva o álbum vazio e limpa a tela de figurinhas abertas
        localStorage.setItem('meuAlbum', JSON.stringify(albumSalvo));
        containerPacote.innerHTML = "";
        
        // Atualiza o topo da tela para 0
        atualizarPlacar();
    }
}

botaoAbrir.addEventListener('click', abrirPacotinho);
botaoReset.addEventListener('click', resetarAlbum); // Vincula o botão de reset à função
