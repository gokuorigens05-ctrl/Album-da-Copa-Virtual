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
const txtNomeSelecaoAtiva = document.getElementById('nome-selecao-ativa');

const SEGREDO_SENHA = "1234";
let adminAutenticado = false;
const btnAdminTrigger = document.getElementById('btn-admin-trigger');
const painelAdmin = document.getElementById('painel-admin');
const admAddEnv = document.getElementById('adm-add-env');
const admAddPts = document.getElementById('adm-add-pts');
const admIdFig = document.getElementById('adm-id-fig');
const admBtnFig = document.getElementById('adm-btn-fig');

// MATRIZ COMPLETA DAS SELEÇÕES EXATAMENTE NA ORDEM ENVIADA
const SELECOES = [
    { nome: "México", sigla: "MEX" }, { nome: "South Africa", sigla: "RSA" }, { nome: "Korea Republic", sigla: "KOR" }, { nome: "Czechia", sigla: "CZE" },
    { nome: "Canada", sigla: "CAN" }, { nome: "Bosnia-Hezergovina", sigla: "BIH" }, { nome: "Qatar", sigla: "QAT" }, { nome: "Switzerland", sigla: "SUI" },
    { nome: "Brazil", sigla: "BRA" }, { nome: "Morroco", sigla: "MAR" }, { nome: "Haiti", sigla: "HAI" }, { nome: "Scotland", sigla: "SCO" },
    { nome: "USA", sigla: "USA" }, { nome: "Paraguay", sigla: "PAR" }, { nome: "Australia", sigla: "AUS" }, { nome: "Turkiye", sigla: "TUR" },
    { nome: "Germany", sigla: "GER" }, { nome: "Curaçao", sigla: "CUW" }, { nome: "Cote d'Ivoire", sigla: "CIV" }, { nome: "Ecuador", sigla: "ECU" },
    { nome: "Netherlands", sigla: "NED" }, { nome: "Japan", sigla: "JPN" }, { nome: "Sweden", sigla: "SWE" }, { nome: "Tunisia", sigla: "TUN" },
    { nome: "Belgium", sigla: "BEL" }, { nome: "Egypt", sigla: "EGY" }, { nome: "IR Iran", sigla: "IRN" }, { nome: "New Zealand", sigla: "NZL" },
    { nome: "Spain", sigla: "ESP" }, { nome: "Cabo Verde", sigla: "CPV" }, { nome: "Saudi Arabia", sigla: "KSA" }, { nome: "Uruguay", sigla: "URU" },
    { nome: "France", sigla: "FRA" }, { nome: "Senegal", sigla: "SEN" }, { nome: "Iraq", sigla: "IRQ" }, { nome: "Norway", sigla: "NOR" },
    { nome: "Argentina", sigla: "ARG" }, { nome: "Algeria", sigla: "ALG" }, { nome: "Austria", sigla: "AUT" }, { nome: "Jordan", sigla: "JOR" },
    { nome: "Portugal", sigla: "POR" }, { nome: "Congo DR", sigla: "COD" }, { nome: "Uzbekistan", sigla: "UZB" }, { nome: "Colombia", sigla: "COL" },
    { nome: "England", sigla: "ENG" }, { nome: "Croatia", sigla: "CRO" }, { nome: "Ghana", sigla: "GHA" }, { nome: "Panama", sigla: "PAN" }
];

let albumSalvo = JSON.parse(localStorage.getItem('meuAlbum')) || {
    coladas: [],
    naMao: [],      
    repetidas: [],   
    envelopes: 5,
    pontos: 100,
    ultimaColeta: null
};

// Inicializações básicas estruturais
gerarOpcoesDePaginas();
atualizarPlacar();
verificarTempoDiario();
renderizarGradeAlbum();

setInterval(verificarTempoDiario, 1000);

// Mapeia inteligentemente os dados dinâmicos de cada ID de figurinha do jogo
function obterInfoFigurinha(id) {
    if (id <= 20) {
        return { pais: "Fifa World Cup", sigla: "FWC", textoCard: `FWC #${id}` };
    } else if (id > 980) {
        return { pais: "Fifa World Cup", sigla: "FWC", textoCard: `FWC #${id}` };
    } else {
        let indiceSelecao = Math.floor((id - 21) / FIGURINHAS_POR_PAGINA);
        let info = SELECOES[indiceSelecao];
        return { pais: info.nome, sigla: info.sigla, textoCard: `${info.sigla} #${id}` };
    }
}

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
            let infoSel = SELECOES[p - 2];
            opt.innerText = `Pág. ${p} - ${infoSel.nome} (${infoSel.sigla}) (Nº ${de} a ${ate})`;
        }
        seletorPagina.appendChild(opt);
    }
}

function abrirPacotinho() {
    if (albumSalvo.envelopes <= 0) return;
    albumSalvo.envelopes--;
    containerPacote.innerHTML = ""; // Limpa os cards anteriores
    
    for (let i = 0; i < FIGURINHAS_POR_PACOTE; i++) {
        let numeroSorteado = Math.floor(Math.random() * TOTAL_FIGURINHAS) + 1;
        let raridade = (numeroSorteado % 50 === 0) ? "Lenda" : "Normal";
        
        let infoFig = obterInfoFigurinha(numeroSorteado);
        let statusTexto = "";
        
        let jaColada = albumSalvo.coladas.includes(numeroSorteado);
        let jaTemNaMao = albumSalvo.naMao.includes(numeroSorteado);

        if (!jaColada && !jaTemNaMao) {
            albumSalvo.naMao.push(numeroSorteado);
            statusTexto = "<b style='color: #007bff;'>NA MÃO (A COLAR)</b>";
            albumSalvo.pontos += 2;
        } else {
            albumSalvo.repetidas.push(numeroSorteado);
            statusTexto = "<b style='color: #e67e22;'>REPETIDA</b>";
            albumSalvo.pontos += 1;
        }
        
        let card = document.createElement('div');
        card.classList.add('figurinha-card');
        if (raridade === "Lenda") card.classList.add('Lenda');
        
        card.innerHTML = `
            <span style="font-size: 22px; margin-bottom: 5px;">${raridade === "Lenda" ? "🌟" : "⚽"}</span>
            <h4 style="margin: 2px 0; font-size: 13px; color: #8a1538;">${infoFig.pais}</h4>
            <h5 style="margin: 3px 0; font-size: 16px; letter-spacing: 0.5px;">${infoFig.textoCard}</h5>
            <p style="margin: 8px 0 0 0; font-size: 11px;">${statusTexto}</p>
        `;
        containerPacote.appendChild(card);
    }
    localStorage.setItem('meuAlbum', JSON.stringify(albumSalvo));
    atualizarPlacar();
    renderizarGradeAlbum(); 
}

// Lógica de colagem incrementada com animação temporária de impacto visual
function colarFigurinha(id, elementoSlot) {
    if (albumSalvo.naMao.includes(id)) {
        albumSalvo.naMao = albumSalvo.naMao.filter(item => item !== id);
        albumSalvo.coladas.push(id);
        
        localStorage.setItem('meuAlbum', JSON.stringify(albumSalvo));
        atualizarPlacar();
        
        // Ativa a animação de impacto no slot antes de redesenhar completamente a tela
        elementoSlot.classList.remove('disponivel-para-colar');
        elementoSlot.classList.add('animacao-colar');
        
        let ehLenda = (id % 50 === 0);
        if (ehLenda) {
            elementoSlot.classList.add('colado-lenda');
            elementoSlot.innerHTML = `<span>🌟</span><span style="font-size:9px;">${obterInfoFigurinha(id).textoCard}</span>`;
        } else {
            elementoSlot.classList.add('colado');
            elementoSlot.innerHTML = `<span>⚽</span><span style="font-size:9px;">${obterInfoFigurinha(id).textoCard}</span>`;
        }
        
        // Espera a animação do CSS terminar (500ms) para renderizar a página limpa
        setTimeout(() => {
            renderizarGradeAlbum();
        }, 500);
    }
}

function renderizarGradeAlbum() {
    gradeAlbum.innerHTML = "";
    let paginaAtual = parseInt(seletorPagina.value) || 1;
    
    let idInicial = (paginaAtual - 1) * FIGURINHAS_POR_PAGINA + 1;
    let idFinal = idInicial + (FIGURINHAS_POR_PAGINA - 1);

    if (paginaAtual === 1) {
        txtNomeSelecaoAtiva.innerText = "🏆 Página Inicial - Especiais FWC 🏆";
    } else if (paginaAtual === TOTAL_PAGINAS) {
        txtNomeSelecaoAtiva.innerText = "⭐ Encerramento do Álbum FWC ⭐";
    } else {
        let infoSel = SELECOES[paginaAtual - 2];
        txtNomeSelecaoAtiva.innerText = `⚽ ${infoSel.nome} (${infoSel.sigla}) ⚽`;
    }

    for (let id = idInicial; id <= idFinal; id++) {
        let slot = document.createElement('div');
        slot.classList.add('slot-album');
        
        let jaColada = albumSalvo.coladas.includes(id);
        let estaNaMao = albumSalvo.naMao.includes(id);
        let ehLenda = (id % 50 === 0);
        let infoFig = obterInfoFigurinha(id);

        if (jaColada) {
            if (ehLenda) {
                slot.classList.add('colado-lenda');
                slot.innerHTML = `<span>🌟</span><span style="font-size:9px;">${infoFig.textoCard}</span>`;
            } else {
                slot.classList.add('colado');
                slot.innerHTML = `<span>⚽</span><span style="font-size:9px;">${infoFig.textoCard}</span>`;
            }
        } else if (estaNaMao) {
            slot.classList.add('disponivel-para-colar');
            slot.innerHTML = `<span style="font-size:10px;">${infoFig.textoCard}</span><span class="btn-colar-tag">COLAR!</span>`;
            slot.addEventListener('click', () => {
                colarFigurinha(id, slot);
            });
        } else {
            slot.innerText = infoFig.textoCard;
        }
        
        gradeAlbum.appendChild(slot);
    }
}

function comprarEnvelope() {
    if (albumSalvo.points >= PRECO_ENVELOPE || albumSalvo.pontos >= PRECO_ENVELOPE) {
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
