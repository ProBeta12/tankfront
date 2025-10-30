// tiros.js
import socket from './socket.js';

const tiros = {}; // { idTiro: { el, x, y, angle, vx, vy } }
const velocidadeTiro = 8;
let playerId = null;
let ultimoTiro = 0; // timestamp do último disparo

// Inicializa o sistema de tiros
export function iniciarTiros(id) {
    playerId = id;
    animarTiros();
}

// Dispara um tiro a partir da posição e ângulo do tanque
export function dispararTiro() {
    const agora = Date.now();
    if (agora - ultimoTiro < 2000) return; // intervalo de 3 segundos
    ultimoTiro = agora;

    if (!playerId) return;

    const tanqueEl = document.getElementById('tanque-' + playerId);
    if (!tanqueEl) return;

    const rect = tanqueEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const angleDeg = parseFloat(tanqueEl.dataset.angle || 0);
    const angleRad = (angleDeg - 90) * Math.PI / 180;

    // Cria tiro localmente (client-side prediction)
    const idTiro = `local-${Date.now()}`;
    criarTiroLocal(idTiro, centerX, centerY, angleRad);

    // Envia para o servidor
    socket.send(JSON.stringify({
        type: 'shoot',
        x: centerX,
        y: centerY,
        angle: angleRad,
        jogadorId: playerId
    }));

    console.log(`🔫 Enviado tiro: x=${centerX.toFixed(1)}, y=${centerY.toFixed(1)}, ang=${angleRad.toFixed(2)} rad`);
}

// Atualiza os tiros recebidos do servidor
export function atualizarTirosDoServidor(serverTiros) {
    Object.keys(serverTiros).forEach(id => {
        const t = serverTiros[id];
        if (!tiros[id]) {
            const el = document.createElement('div');
            el.className = 'tiro';
            el.style.position = 'absolute';
            el.style.width = '8px';
            el.style.height = '8px';
            el.style.background = 'red';
            el.style.borderRadius = '50%';
            el.style.transform = 'translate(-50%, -50%)'; // centraliza
            document.body.appendChild(el);

            tiros[id] = {
                el,
                x: t.x,
                y: t.y,
                angle: t.angle,
                vx: Math.cos(t.angle) * velocidadeTiro,
                vy: Math.sin(t.angle) * velocidadeTiro
            };

            console.log(`💥 Tiro criado: ID=${id}, x=${t.x.toFixed(1)}, y=${t.y.toFixed(1)}`);
        } else {
            tiros[id].x = t.x;
            tiros[id].y = t.y;
        }
    });

    // Remove tiros inexistentes
    Object.keys(tiros).forEach(id => {
        if (!serverTiros[id]) {
            if (document.body.contains(tiros[id].el))
                document.body.removeChild(tiros[id].el);
            delete tiros[id];
            console.log(`❌ Tiro removido do cliente: ${id}`);
        }
    });
}

// Cria tiro local para o jogador (client-side prediction)
function criarTiroLocal(id, x, y, angle) {
    const el = document.createElement('div');
    el.className = 'tiro';
    el.style.position = 'absolute';
    el.style.width = '8px';
    el.style.height = '8px';
    el.style.background = 'red';
    el.style.borderRadius = '50%';
    el.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(el);

    tiros[id] = {
        el,
        x,
        y,
        angle,
        vx: Math.cos(angle) * velocidadeTiro,
        vy: Math.sin(angle) * velocidadeTiro
    };
}

// Anima localmente os tiros (client-side)
function animarTiros() {
    Object.values(tiros).forEach(tiro => {
        tiro.x += tiro.vx;
        tiro.y += tiro.vy;
        tiro.el.style.left = tiro.x + 'px';
        tiro.el.style.top = tiro.y + 'px';
        criarRastro(tiro.x, tiro.y);
    });
    requestAnimationFrame(animarTiros);
}

function criarRastro(x, y) {
    const rastro = document.createElement('div');
    rastro.classList.add('rastro');
    rastro.style.left = x + 'px';
    rastro.style.top = y + 'px';
    document.body.appendChild(rastro);

    // Remove automaticamente após a animação
    setTimeout(() => {
        if (rastro.parentNode) rastro.remove();
    }, 500);
}

