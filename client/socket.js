// socket.js
const socket = new WebSocket('ws://localhost:8080');

socket.addEventListener('open', () => {
    console.log('Conectado ao servidor WebSocket!');
});



socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    console.log('Mensagem do servidor:', data);
});

// Disponibiliza o socket globalmente para outros scripts
window.socket = socket;
