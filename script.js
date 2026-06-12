const TOTAL_FIGURINHAS = 1000;
const FIGURINHAS_POR_PACOTE = 8;

const botaoAbrir = document.getElementById('btn-abrir');
const containerPacote = document.getElementById('pacote-aberto');
const txtPlacar = document.getElementById('placar-progresso');

// --- SISTEMA DE INVENTÁRIO (MEMÓRIA DO NAVEGADOR) ---
// Tenta carregar o álbum salvo. Se não existir, cria um do zero vazio.
let albumSalvo = JSON.parse(localStorage.getItem('meuAlbum')) || {
    coladas: [],
    repetidas: []
};

// Atualiza o placar assim que o site abre
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
        
        // --- LOGICA DE COLAR OU REPETIR ---
        let statusTexto = "";
        
        // Se a figurinha NÃO está na lista de coladas, ela é colada agora!
        if (!albumSalvo.coladas.includes(figurinha.id)) {
            albumSalvo.coladas.push(figurinha.id);
            statusTexto = "<b style='color: green;'>¡NOVA!</b>";
        } else {
            // Se já tem, vai para a pilha de repetidas
            albumSalvo.repetidas.push(figurinha.id);
            statusTexto = "<b style='color: orange;'>REPETIDA</b>";
        }
        
        // Criando o card visual
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

    // Salva as listas atualizadas na memória do navegador
    localStorage.setItem('meuAlbum', JSON.stringify(albumSalvo));
    
    // Atualiza os números no topo da tela
    atualizarPlacar();
}

function atualizarPlacar() {
    let totalColadas = albumSalvo.coladas.length;
    let porcentagem = ((totalColadas / TOTAL_FIGURINHAS) * 100).toFixed(1);
    txtPlacar.innerText = `Progresso: ${totalColadas} / ${TOTAL_FIGURINHAS} (${porcentagem}%) | Repetidas na sacola: ${albumSalvo.repetidas.length}`;
}

botaoAbrir.addEventListener('click', abrirPacotinho);
