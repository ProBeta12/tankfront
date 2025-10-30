## Visão geral

Este projeto ilustra a ideia de um sistema distribuído simples usando WebSocket.
Existem duas partes separadas que rodam aplicações diferentes:

- `client/` — aplicação web estática (HTML/JS/CSS) que roda no navegador.
- `server/` — aplicação Node.js que fornece a lógica do servidor e um servidor WebSocket.

O objetivo é demonstrar comunicação em tempo real entre clientes e servidor usando WebSockets,
com o cliente servido via HTTP na rede local (LAN) e o servidor rodando como processo Node.

## Estrutura do projeto

- `client/` — arquivos do frontend (ex.: `index.html`, `main.js`, `assets/`).
- `server/` — código do servidor em Node.js (ex.: `main.js`, `movimentacao.js`, `tiros.js`).
- `readme.md` — este arquivo.

## Pré-requisitos

- Node.js instalado (recomenda-se Node 14+ ou 16+).
- npm (vem com o Node).
- Acesso à rede local (para tornar o site do `client/` acessível por outros dispositivos na LAN).

## Executando o cliente (tornar o site público na LAN)

Abra um terminal PowerShell na pasta do projeto e rode:

instale globalmente http-server:

```No terminal 
npm install -g http-server
# depois
cd client
http-server -p 3000 
```

Explicação:
- `-p 3000` define a porta HTTP usada pelo servidor estático. (Uso 3000 para evitar conflito com o WebSocket do servidor, que roda em 8080.)

Em outro computador na mesma rede, abra o navegador em:

```
http://<IP_DO_SERVIDOR>:3000
```

Para descobrir o IP do computador que está servindo (Windows):

```powershell
ipconfig
```

Procure o endereço IPv4 da interface de rede usada (ex.: 192.168.1.42).

## Executando o servidor

O servidor está em `server/` e usa Node.js e WebSocket. Por padrão `server/main.js` configura um WebSocket na porta 8080.

Passos para rodar o servidor:

```powershell
cd server
npm install
node main.js
```

Depois de iniciado, o servidor deve imprimir algo como:

```
Servidor WebSocket rodando na porta 8080
```

Os clientes (o frontend) devem conectar no endpoint WebSocket em:

```
ws://<IP_DO_SERVIDOR>:8080
```

## Teste rápido

1. Rode o servidor (`node main.js`) em uma máquina.
2. Sirva o cliente (`http-server`) na mesma máquina ou em outra na LAN.
3. Abra o navegador em `http://<IP_DO_SERVIDOR>:3000` e verifique o console do navegador (DevTools) para mensagens de conexão WebSocket.

## Observações e dicas

- O `server/main.js` usa a porta 8080 para WebSocket. Não use a mesma porta para o servidor HTTP do cliente — por isso sugerimos 3000 para o cliente.
- Se o Windows solicitar permissão no firewall ao iniciar o servidor Node, permita o acesso para rede privada (LAN).
- Se quiser outra porta, altere `-p 3000` no `http-server` ou modifique a porta em `server/main.js`.


