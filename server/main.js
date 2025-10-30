import { WebSocketServer } from 'ws';
import { configurarMovimentacao } from './movimentacao.js';
import { configurarTiros } from './tiros.js';

const wss = new WebSocketServer({ port: 8080 });

configurarMovimentacao(wss);
configurarTiros(wss);


console.log('Servidor WebSocket rodando na porta 8080');
