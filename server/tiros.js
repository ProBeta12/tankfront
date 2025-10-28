// tiros.js
let tiros = []; // {idTiro, idJogador, x, y, angle, inicio}
const tempoVidaTiro = 3000; // 3s

// Adiciona um tiro
function adicionarTiro(idJogador, x, y, angle) {
    tiros.push({
        idTiro: Date.now() + Math.random(), // ID único
        idJogador,
        x,
        y,
        angle,
        inicio: Date.now()
    });
}

// Atualiza e remove tiros expirados
function atualizarTiros() {
    const agora = Date.now();
    tiros = tiros.filter(t => (agora - t.inicio) <= tempoVidaTiro);
}

// Retorna todos os tiros ativos
function obterTiros() {
    return tiros;
}

// Remove tiros de um jogador (quando ele sai)
function removerTirosDoJogador(idJogador) {
    tiros = tiros.filter(t => t.idJogador !== idJogador);
}

export { adicionarTiro, atualizarTiros, obterTiros, removerTirosDoJogador };
