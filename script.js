// Configuração atualizada do Álbum
const TOTAL_FIGURINHAS = 1000;
const FIGURINHAS_POR_PACOTE = 8;

const botaoAbrir = document.getElementById('btn-abrir');
const containerPacote = document.getElementById('pacote-aberto');

function gerarFigurinhaAleatoria() {
    // Agora sorteia um número de 1 a 1000
    let numeroSorteado = Math.floor(Math.random() * TOTAL_FIGURINHAS) + 1;
    
    // Regra de raridade: se o número terminar com 00 ou 50 (ex: 50, 100, 150...), vira LENDA
    let raridade = "Normal";
    if (numeroSorteado % 50 === 0) {
        raridade = "Lenda";
    }

    return {
        id: numeroSorteado,
        nome: `Jogador #${numeroSorteado}`,
        raridade: raridade
    };
}

function abrirPacotinho() {
    containerPacote.innerHTML = "";
    
    // O laço agora roda 8 vezes para entregar 8 figurinhas
    for (let i = 0; i < FIGURINHAS_POR_PACOTE; i++) {
        let figurinha = gerarFigurinhaAleatoria();
        
        let card = document.createElement('div');
        card.classList.add('figurinha-card');
        
        if (figurinha.raridade === "Lenda") {
            card.classList.add('Lenda');
        }
        
        card.innerHTML = `
            <span style="font-size: 24px;">${figurinha.raridade === "Lenda" ? "🌟" : "⚽"}</span>
            <h4 style="margin: 10px 0 5px 0;">${figurinha.nome}</h4>
            <p style="margin: 0; color: #777; font-size: 14px;">ID: ${figurinha.id}</p>
        `;
        
        containerPacote.appendChild(card);
    }
}

botaoAbrir.addEventListener('click', abrirPacotinho);
