import { WebSocketServer } from 'ws';
import { configurarMovimentacao } from './movimentacao.js';
import { configurarTiros } from './tiros.js';
import { configurarColisao } from './colisao.js';

const wss = new WebSocketServer({ port: 8080 });

const tanques = {}; // {id: {x, y, angle}}
const tiros = {};   // {idTiro: {x, y, angle, jogadorId}}

// Passa o WebSocketServer e os objetos para cada módulo
configurarMovimentacao(wss, tanques);
configurarTiros(wss, tiros);
configurarColisao(wss, tanques, tiros);

console.log('Servidor WebSocket rodando na porta 8080');
