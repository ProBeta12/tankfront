import socket from './socket.js';
import { iniciarTiros, dispararTiro, atualizarTirosDoServidor } from './tiros.js';

export function iniciarMovimentacao() {
    let playerId = null;
    const teclas = {};
    let x = 200, y = 200, angle = 0;
    const speed = 3;
    const tanques = {};

    const LARGURA_TANQUE = 50;
    const ALTURA_TANQUE = 50;

    // Detecta teclas
    document.addEventListener('keydown', e => teclas[e.key] = true);
    document.addEventListener('keyup', e => teclas[e.key] = false);

    // ===== MOVIMENTAÇÃO =====
    setInterval(() => {
        if (!playerId) return;

        let movX = 0, movY = 0;
        if (teclas['ArrowUp']) movY -= 1;
        if (teclas['ArrowDown']) movY += 1;
        if (teclas['ArrowLeft']) movX -= 1;
        if (teclas['ArrowRight']) movX += 1;

        if (movX !== 0 || movY !== 0) {
            const norm = Math.sqrt(movX * movX + movY * movY);
            x += speed * movX / norm;
            y += speed * movY / norm;
            angle = Math.atan2(movY, movX) * 180 / Math.PI + 90;

            // 🔒 Limite de tela
            const maxX = window.innerWidth - LARGURA_TANQUE;
            const maxY = window.innerHeight - ALTURA_TANQUE;
            x = Math.max(0, Math.min(x, maxX));
            y = Math.max(0, Math.min(y, maxY));

            // Atualiza posição do tanque local
            const meuTanque = tanques[playerId];
            if (meuTanque) {
                meuTanque.style.left = x + 'px';
                meuTanque.style.top = y + 'px';
                meuTanque.style.transform = `rotate(${angle}deg)`;
            }

            // Envia posição ao servidor
            socket.send(JSON.stringify({ type: 'move', x, y, angle }));
        }

        if (teclas[' ']) dispararTiro();
    }, 1000 / 60);

    // ===== RECEBE MENSAGENS =====
    socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'init') {
            playerId = data.id;
            tanques[playerId] = getOrCreateTank(playerId);
            iniciarTiros(playerId);
            console.log(`🟢 Jogador inicializado com ID ${playerId}`);
        }

        if (data.type === 'update') {
            atualizarTanques(data.tanks);
        }

        if (data.type === 'tiros') {
            atualizarTirosDoServidor(data.tiros);
        }
    });

    // ===== FUNÇÕES DE TANQUE =====
    function atualizarTanques(tanksData) {
        Object.keys(tanksData).forEach(id => {
            const t = tanksData[id];
            if (!tanques[id]) tanques[id] = getOrCreateTank(id);

            const el = tanques[id];
            el.style.left = t.x + 'px';
            el.style.top = t.y + 'px';
            el.style.transform = `rotate(${t.angle}deg)`;
            el.dataset.angle = t.angle;
        });
    }

    function getOrCreateTank(id) {
        let el = document.getElementById('tanque-' + id);
        if (!el) {
            el = document.createElement('div');
            el.id = 'tanque-' + id;
            el.className = 'tanque';
            el.style.position = 'absolute';
            el.style.width = LARGURA_TANQUE + 'px';
            el.style.height = ALTURA_TANQUE + 'px';

            const img = document.createElement('img');
            img.src = './assets/img/t1.png';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.transform = 'rotate(180deg)';
            img.style.transformOrigin = 'center center';
            el.appendChild(img);

            document.body.appendChild(el);
        }
        return el;
    }
}
