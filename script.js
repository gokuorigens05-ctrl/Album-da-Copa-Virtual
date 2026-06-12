const TOTAL_FIGURINHAS = 1000;
const FIGURINHAS_POR_PACOTE = 8;
const PRECO_ENVELOPE = 25;
const FIGURINHAS_POR_PAGINA = 20;
const TOTAL_PAGINAS = 50;

const botaoAbrir = document.getElementById('btn-abrir');
const botaoReset = document.getElementById('btn-reset');
const botaoComprar = document.getElementById('btn-comprar');
const botaoDiario = document.getElementById('btn-diario');
const containerPacote = document.getElementById('pacote-aberto');
const txtPlacar = document.getElementById('placar-progresso');
const txtEnvelopes = document.getElementById('placar-envelopes');
const txtPontos = document.getElementById('placar-pontos');

const seletorPagina = document.getElementById('select-pagina');
const gradeAlbum = document.getElementById('grade-album');

const SEGREDO_SENHA = "1234";
let adminAutenticado = false;
const btnAdminTrigger = document.getElementById('btn-admin-trigger');
const painelAdmin = document.getElementById('painel-admin');
const admAddEnv = document.getElementById('adm-add-env');
const admAddPts = document.getElementById('adm-add-pts');
const admIdFig = document.getElementById('adm-id-fig');
const admBtnFig = document.getElementById('adm-btn-fig');

// Banco de dados adaptado com a lista 'naMao' para o armazenamento temporário
let albumSalvo = JSON.parse(localStorage.getItem('meuAlbum')) || {
    coladas: [],
    naMao: [],      
    repetidas: [],   
    envelopes: 5,
    pontos: 100,
    ultimaColeta: null
};

// Inicializadores essenciais na ordem correta
gerarOpcoesDePaginas();
atualizarPlacar();
verificarTempoDiario();
renderizarGradeAlbum();

setInterval(verificarTempoDiario, 1000);

// Cria o menu de 50 páginas seguindo as regras exatas informadas
function gerarOpcoesDePaginas() {
    seletorPagina.innerHTML = "";
    for (let p = 1; p <= TOTAL_PAGINAS; p++) {
        let de = (p - 1) * FIGURINHAS_POR_PAGINA + 1;
        let ate = de + FIGURINHAS_POR_PAGINA - 1;
        
        let opt = document.createElement('option');
        opt.value = p;
        
        if (p === 1) {
            opt.innerText = `Pág. 1 - Especiais (Nº ${de} a ${ate})`;
        } else if (p === TOTAL_PAGINAS) {
            opt.innerText = `Pág. 50 - Encerramento (Nº ${de} a ${ate})`;
        } else {
            opt.innerText = `Pág. ${p} - Seleção ${p - 1} (Nº ${de} a ${ate})`;
        }
        seletorPagina.appendChild(opt);
    }
}

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
        
        let jaColada = albumSalvo.coladas.includes(figurinha.id);
        let jaTemNaMao = albumSalvo.naMao.includes(figurinha.id);

        // Se o usuário ainda não colou E não tem na mão, ela vai para a mão para ser colada
        if (!jaColada && !jaTemNaMao) {
            albumSalvo.naMao.push(figurinha.id);
            statusTexto = "<b style='color: #2f5597;'>NA MÃO (A COLAR)</b>";
            albumSalvo.pontos += 2;
        } else {
            // Se já tiver colado ou já estiver segurando uma idêntica na mão, vira repetida direta
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
    renderizarGradeAlbum(); 
}

// Executa a colagem manual tirando da mão e inserindo no álbum definitivo
function colarFigurinha(id) {
    if (albumSalvo.naMao.includes(id)) {
        // Remove da lista provisória da mão
        albumSalvo.naMao = albumSalvo.naMao.filter(item => item !== id);
        // Insere nas coladas oficiais
        albumSalvo.coladas.push(id);
        
        localStorage.setItem('meuAlbum', JSON.stringify(albumSalvo));
        atualizarPlacar();
        renderizarGradeAlbum();
    }
}

// Renderiza os 20 elementos baseados na regra matemática estrita de 20 por página
function renderizarGradeAlbum() {
    gradeAlbum.innerHTML = "";
    let paginaAtual = parseInt(seletorPagina.value) || 1;
    
    let idInicial = (paginaAtual - 1) * FIGURINHAS_POR_PAGINA + 1;
    let idFinal = idInicial + (FIGURINHAS_POR_PAGINA - 1);

    for (let id = idInicial; id <= idFinal; id++) {
        let slot = document.createElement('div');
        slot.classList.add('slot-album');
        
        let jaColada = albumSalvo.coladas.includes(id);
        let estaNaMao = albumSalvo.naMao.includes(id);
        let ehLenda = (id % 50 === 0);

        if (jaColada) {
            if (ehLenda) {
                slot.classList.add('colado-lenda');
                slot.innerHTML = `<span>🌟</span><span style="font-size:10px;">#${id}</span>`;
            } else {
                slot.classList.add('colado');
                slot.innerHTML = `<span>⚽</span><span style="font-size:10px;">#${id}</span>`;
            }
        } else if (estaNaMao) {
            // Se está na mão e livre, cria o slot verde interativo com clique para colar
            slot.classList.add('disponivel-para-colar');
            slot.innerHTML = `<span>#${id}</span><span class="btn-colar-tag">COLAR!</span>`;
            slot.addEventListener('click', () => {
                colarFigurinha(id);
            });
        } else {
            // Posição vazia cinza mostrando o número da figurinha
            slot.innerText = id;
        }
        
        gradeAlbum.appendChild(slot);
    }
}

function comprarEnvelope() {
    if (albumSalvo.pontos >= PRECO_ENVELOPE) {
        albumSalvo.pontos -= PRECO_ENVELOPE;
        albumSalvo.envelopes++;
        localStorage.setItem('meuAlbum', JSON.stringify(albumSalvo));
        atualizarPlacar();
    }
}

function verificarTempoDiario() {
    if (!albumSalvo.ultimaColeta) {
        botaoDiario.disabled = false;
        botaoDiario.innerText = "Coletar Envelopes Diários 🎁";
        return;
    }
    const agora = new Date().getTime();
    const tempoPassado = agora - albumSalvo.ultimaColeta;
    const vinteQuatroHoras = 24 * 60 * 60 * 1000;

    if (tempoPassado >= vinteQuatroHoras) {
        botaoDiario.disabled = false;
        botaoDiario.innerText = "Coletar Envelopes Diários 🎁";
    } else {
        botaoDiario.disabled = true;
        const tempoRestante = vinteQuatroHoras - tempoPassado;
        const horas = Math.floor(tempoRestante / (1000 * 60 * 60));
        const minutos = Math.floor((tempoRestante % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((tempoRestante % (1000 * 60)) / 1000);
        botaoDiario.innerText = `Próximo pacote em: ${horas}h ${minutos}m ${segundos}s`;
    }
}

function coletarDiario() {
    albumSalvo.envelopes += 5;
    albumSalvo.ultimaColeta = new Date().getTime();
    localStorage.setItem('meuAlbum', JSON.stringify(albumSalvo));
    atualizarPlacar();
    verificarTempoDiario();
}

function atualizarPlacar() {
    let totalColadas = albumSalvo.coladas.length;
    let porcentagem = ((totalColadas / TOTAL_FIGURINHAS) * 100).toFixed(1);
    
    // Inicializa campos de segurança caso o cache do navegador venha incompleto
    let contagemMao = albumSalvo.naMao ? albumSalvo.naMao.length : 0;
    let contagemRepetidas = albumSalvo.repetidas ? albumSalvo.repetidas.length : 0;

    txtPlacar.innerText = `Coladas: ${totalColadas} / ${TOTAL_FIGURINHAS} (${porcentagem}%) | Na Mão: ${contagemMao} | Repetidas: ${contagemRepetidas}`;
    txtEnvelopes.innerText = `✉️ Envelopes: ${albumSalvo.envelopes}`;
    txtPontos.innerText = `🪙 Pontos: ${albumSalvo.pontos}`;
    botaoAbrir.disabled = albumSalvo.envelopes <= 0;
    botaoComprar.disabled = albumSalvo.pontos < PRECO_ENVELOPE;
}

function resetarAlbum() {
    if (confirm("Tem certeza que deseja resetar todo o seu álbum?")) {
        albumSalvo = { coladas: [], naMao: [], repetidas: [], envelopes: 5, pontos: 100, ultimaColeta: null };
        localStorage.setItem('meuAlbum', JSON.stringify(albumSalvo));
        containerPacote.innerHTML = "";
        atualizarPlacar();
        verificarTempoDiario();
        renderizarGradeAlbum();
    }
}

seletorPagina.addEventListener('change', renderizarGradeAlbum);

// Painel Administrativo adaptado para colocar na Mão do jogador para testes
btnAdminTrigger.addEventListener('click', () => {
    if (!adminAutenticado) {
        if (prompt("Digite a senha:") === SEGREDO_SENHA) { adminAutenticado = true; painelAdmin.style.display = "block"; }
    } else { painelAdmin.style.display = painelAdmin.style.display === "block" ? "none" : "block"; }
});
admAddEnv.addEventListener('click', () => { albumSalvo.envelopes += 50; localStorage.setItem('meuAlbum', JSON.stringify(albumSalvo)); atualizarPlacar(); });
admAddPts.addEventListener('click', () => { albumSalvo.pontos += 500; localStorage.setItem('meuAlbum', JSON.stringify(albumSalvo)); atualizarPlacar(); });
admBtnFig.addEventListener('click', () => {
    let id = parseInt(admIdFig.value);
    if (isNaN(id) || id < 1 || id > TOTAL_FIGURINHAS) return;
    
    if (!albumSalvo.coladas.includes(id) && !albumSalvo.naMao.includes(id)) {
        albumSalvo.naMao.push(id);
    } else {
        albumSalvo.repetidas.push(id);
    }
    localStorage.setItem('meuAlbum', JSON.stringify(albumSalvo));
    atualizarPlacar();
    renderizarGradeAlbum();
    admIdFig.value = "";
});

botaoAbrir.addEventListener('click', abrirPacotinho);
botaoReset.addEventListener('click', resetarAlbum);
botaoComprar.addEventListener('click', comprarEnvelope);
botaoDiario.addEventListener('click', coletarDiario);
