// movimentacao.js
const tanque = document.getElementById('tanque');

let x = Math.random() * (window.innerWidth - tanque.offsetWidth);
let y = Math.random() * (window.innerHeight - tanque.offsetHeight);
let angle = 0;
let playerId = null;
const speed = 2;
const teclas = {}; // Estado das teclas
const outros = {};  // Outros jogadores
const tiros = [];
const velocidadeTiro = 5;
const tamanhoTiro = 8;
const tempoRecarga = 500; // 500ms entre tiros
let podeAtirar = true;

// === Cria hitbox igual à dos inimigos ===
const minhaHitbox = document.createElement('div');
minhaHitbox.className = 'hitbox';
minhaHitbox.style.position = 'absolute';
minhaHitbox.style.width = '26px';
minhaHitbox.style.height = '26px';
minhaHitbox.style.left = '50%';
minhaHitbox.style.top = '50%';
minhaHitbox.style.transform = 'translate(-50%, -50%)';
tanque.appendChild(minhaHitbox);

// Detecta teclas
document.addEventListener('keydown', e => teclas[e.key] = true);
document.addEventListener('keyup', e => teclas[e.key] = false);

// Detecta tiro
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (podeAtirar && playerId !== null) {
            atirar();
            podeAtirar = false;
            setTimeout(() => { podeAtirar = true; }, tempoRecarga);
        }
    }
});

// Função de tiro
function atirar() {
    const rect = tanque.getBoundingClientRect();
    const tiroX = rect.left + rect.width / 2 - tamanhoTiro / 2;
    const tiroY = rect.top + rect.height / 2 - tamanhoTiro / 2;

    criarTiro(playerId, tiroX, tiroY, angle);

    if (window.socket && window.socket.readyState === WebSocket.OPEN) {
        window.socket.send(JSON.stringify({
            type: 'shoot',
            x: tiroX,
            y: tiroY,
            angle
        }));
    }
}

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
    document.body.appendChild(tiro);

    tiros.push({ element: tiro, x, y, angle });
}

function atualizarTiros() {
    const margem = 10;
    for (let i = tiros.length - 1; i >= 0; i--) {
        const t = tiros[i];
        const rad = t.angle * Math.PI / 180;
        t.x -= velocidadeTiro * Math.sin(rad);
        t.y += velocidadeTiro * Math.cos(rad);
        t.element.style.left = t.x + 'px';
        t.element.style.top = t.y + 'px';

        if (t.x < -tamanhoTiro - margem || t.x > window.innerWidth + margem ||
            t.y < -tamanhoTiro - margem || t.y > window.innerHeight + margem) {
            t.element.remove();
            tiros.splice(i, 1);
        }
    }
    requestAnimationFrame(atualizarTiros);
}

// Atualiza posição do tanque
function atualizarTanque() {
    let movX = 0, movY = 0;
    if (teclas['ArrowUp']) movY -= 1;
    if (teclas['ArrowDown']) movY += 1;
    if (teclas['ArrowLeft']) movX -= 1;
    if (teclas['ArrowRight']) movX += 1;

    if (movX !== 0 || movY !== 0) {
        const norm = Math.sqrt(movX*movX + movY*movY);
        x += speed * movX / norm;
        y += speed * movY / norm;
        angle = Math.atan2(-movX, movY) * 180 / Math.PI;
        window.angle = angle;
        tanque.style.transform = `rotate(${angle}deg)`;
    }

    x = Math.max(0, Math.min(window.innerWidth - tanque.offsetWidth, x));
    y = Math.max(0, Math.min(window.innerHeight - tanque.offsetHeight, y));

    tanque.style.left = x + 'px';
    tanque.style.top = y + 'px';

    if (window.socket && window.socket.readyState === WebSocket.OPEN && playerId !== null) {
        window.socket.send(JSON.stringify({ type: 'move', x, y, angle }));
    }

    requestAnimationFrame(atualizarTanque);
}

// Recebe dados do servidor
window.socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'init') playerId = data.id;

    if (data.type === 'update') {
        const tanksData = data.tanks;

        // Atualiza outros jogadores
        Object.keys(tanksData).forEach(tankId => {
            const t = tanksData[tankId];
            if (tankId == playerId) return;

            if (!outros[tankId]) {
                const otherTank = document.createElement('div');
                otherTank.className = 'tanque';
                otherTank.id = 'tanque-' + tankId;
                otherTank.style.position = 'absolute';
                otherTank.style.width = '50px';
                otherTank.style.height = '50px';

                const img = document.createElement('img');
                img.src = 't1.png';
                img.style.width = '100%';
                img.style.height = '100%';
                otherTank.appendChild(img);

                const hitbox = document.createElement('div');
                hitbox.className = 'hitbox';
                hitbox.style.position = 'absolute';
                hitbox.style.width = '26px';
                hitbox.style.height = '26px';
                hitbox.style.left = '50%';
                hitbox.style.top = '50%';
                hitbox.style.transform = 'translate(-50%, -50%)';
                otherTank.appendChild(hitbox);

                document.body.appendChild(otherTank);
                outros[tankId] = { element: otherTank, hitbox: hitbox };
            }

            const el = outros[tankId].element;
            el.style.left = t.x + 'px';
            el.style.top = t.y + 'px';
            el.style.transform = `rotate(${t.angle}deg)`;
        });

        // Cria tiros de outros jogadores
        if (data.tiros) {
            data.tiros.forEach(tiroData => {
                if (tiroData.idJogador !== playerId) {
                    criarTiro(tiroData.idJogador, tiroData.x, tiroData.y, tiroData.angle);
                }
            });
        }

        // Remove tanques desconectados
        document.querySelectorAll('[id^="tanque-"]').forEach(el => {
            const pid = el.id.replace('tanque-', '');
            if (!tanksData[pid]) {
                el.remove();
                delete outros[pid];
            }
        });
    }
});

atualizarTanque();
atualizarTiros();
