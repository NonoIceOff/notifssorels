const WebSocket = require('ws');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Set();

wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connecté. Total:', clients.size);

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        } catch (e) {
            console.error('Erreur parsing message:', e);
        }
    });

    ws.on('close', () => {
        clients.delete(ws);
        console.log('Client déconnecté. Total:', clients.size);
    });

    ws.on('error', (error) => {
        console.error('Erreur WebSocket:', error);
        clients.delete(ws);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Serveur de signaling WebRTC sur le port ${PORT}`);
});
