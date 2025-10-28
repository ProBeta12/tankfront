// tiro.js
const tiros = [];
const velocidadeTiro = 5;
const tamanhoTiro = 8;
const tempoRecarga = 500; // 500ms entre tiros

let podeAtirar = true;
let playerId = null;
const container = document.body;

// Detecta disparo
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault(); // evita rolagem do body
        if (podeAtirar && playerId !== null) {
            atirar();
            podeAtirar = false;
            setTimeout(() => { podeAtirar = true; }, tempoRecarga);
        }
    }
});

// Função que cria e envia tiro
function atirar() {
    const tanque = document.getElementById('tanque');
    const rect = tanque.getBoundingClientRect();

    const x = rect.left + rect.width / 2 - tamanhoTiro / 2;
    const y = rect.top + rect.height / 2 - tamanhoTiro / 2;

    // Ângulo do tanque (de movimentacao.js)
    const angle = window.angle || 0;

    // Cria tiro local
    criarTiro(playerId, x, y, angle);

    // Envia tiro para o servidor
    if (window.socket && window.socket.readyState === WebSocket.OPEN) {
        window.socket.send(JSON.stringify({
            type: 'shoot',
            x,
            y,
            angle
        }));
    }
}

// Cria tiro visual no cliente
function criarTiro(id, x, y, angle) {
    const tiro = document.createElement('div');
    tiro.className = 'tiro';
    tiro.style.position = 'absolute';
    tiro.style.width = `${tamanhoTiro}px`;
    tiro.style.height = `${tamanhoTiro}px`;
    tiro.style.borderRadius = '50%';
    tiro.style.background = 'red';
    tiro.style.left = `${x}px`;
    tiro.style.top = `${y}px`;
    tiro.style.pointerEvents = 'none';
    container.appendChild(tiro);

    tiros.push({ element: tiro, x, y, angle });
}

// Atualiza todos os tiros
function atualizarTiros() {
    const margem = 10;

    for (let i = tiros.length - 1; i >= 0; i--) {
        const t = tiros[i];
        // Converte ângulo de graus para radianos
        const rad = t.angle * Math.PI / 180;
        t.x -= velocidadeTiro * Math.sin(rad);
        t.y += velocidadeTiro * Math.cos(rad);

        t.element.style.left = t.x + 'px';
        t.element.style.top = t.y + 'px';

        if (
            t.x < -tamanhoTiro - margem || t.x > window.innerWidth + margem ||
            t.y < -tamanhoTiro - margem || t.y > window.innerHeight + margem
        ) {
            t.element.remove();
            tiros.splice(i, 1);
        }
    }

    requestAnimationFrame(atualizarTiros);
}

atualizarTiros();


// Recebe mensagens do servidor
window.socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    // Recebe ID do jogador
    if (data.type === 'init') playerId = data.id;

    // Atualização geral: tanques e tiros
    if (data.type === 'update' && data.tiros) {
        data.tiros.forEach(tiroData => {
            // Cria tiro de outro jogador
            if (tiroData.idJogador !== playerId) {
                criarTiro(tiroData.idJogador, tiroData.x, tiroData.y, tiroData.angle);
            }
        });
    }
});
