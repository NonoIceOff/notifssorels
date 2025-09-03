class FUPSyncManager {
    constructor() {
        this.localConnection = null;
        this.dataChannel = null;
        this.signalingSocket = null;
        this.onFUPTreatedCallback = null;
        this.isInitiator = false;
    }

    async init(onFUPTreated) {
        this.onFUPTreatedCallback = onFUPTreated;
        
        try {
            this.signalingSocket = new WebSocket('ws://localhost:3001');
            
            this.signalingSocket.onopen = () => {
                console.log('[WebRTC] Connecté au serveur de signaling');
                this.createPeerConnection();
            };

            this.signalingSocket.onmessage = (event) => {
                this.handleSignalingMessage(JSON.parse(event.data));
            };

            this.signalingSocket.onerror = (error) => {
                console.error('[WebRTC] Erreur signaling:', error);
            };

        } catch (error) {
            console.error('[WebRTC] Erreur initialisation:', error);
        }
    }

    // Crée la connexion peer-to-peer
    createPeerConnection() {
        this.localConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        if (Math.random() > 0.5) {
            this.isInitiator = true;
            this.dataChannel = this.localConnection.createDataChannel('fup-sync');
            this.setupDataChannel(this.dataChannel);
            this.createOffer();
        }

        this.localConnection.ondatachannel = (event) => {
            if (!this.dataChannel) {
                this.dataChannel = event.channel;
                this.setupDataChannel(this.dataChannel);
            }
        };

        this.localConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendSignalingMessage({
                    type: 'ice-candidate',
                    candidate: event.candidate
                });
            }
        };
    }

    // Configure le data channel
    setupDataChannel(channel) {
        channel.onopen = () => {
            console.log('[WebRTC] Data channel ouvert');
        };

        channel.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'fup-treated' && this.onFUPTreatedCallback) {
                    console.log('[WebRTC] FUP traité reçu:', data.fupId);
                    this.onFUPTreatedCallback(data.fupId);
                }
            } catch (e) {
                console.error('[WebRTC] Erreur parsing message:', e);
            }
        };

        channel.onerror = (error) => {
            console.error('[WebRTC] Erreur data channel:', error);
        };
    }

    // Crée une offre WebRTC
    async createOffer() {
        try {
            const offer = await this.localConnection.createOffer();
            await this.localConnection.setLocalDescription(offer);
            this.sendSignalingMessage({
                type: 'offer',
                offer: offer
            });
        } catch (error) {
            console.error('[WebRTC] Erreur création offre:', error);
        }
    }

    // Crée une réponse WebRTC
    async createAnswer(offer) {
        try {
            await this.localConnection.setRemoteDescription(offer);
            const answer = await this.localConnection.createAnswer();
            await this.localConnection.setLocalDescription(answer);
            this.sendSignalingMessage({
                type: 'answer',
                answer: answer
            });
        } catch (error) {
            console.error('[WebRTC] Erreur création réponse:', error);
        }
    }

    // Gère les messages de signaling
    async handleSignalingMessage(message) {
        try {
            switch (message.type) {
                case 'offer':
                    if (!this.isInitiator) {
                        await this.createAnswer(message.offer);
                    }
                    break;
                case 'answer':
                    if (this.isInitiator) {
                        await this.localConnection.setRemoteDescription(message.answer);
                    }
                    break;
                case 'ice-candidate':
                    await this.localConnection.addIceCandidate(message.candidate);
                    break;
            }
        } catch (error) {
            console.error('[WebRTC] Erreur traitement message:', error);
        }
    }

    // Envoie un message via le serveur de signaling
    sendSignalingMessage(message) {
        if (this.signalingSocket && this.signalingSocket.readyState === WebSocket.OPEN) {
            this.signalingSocket.send(JSON.stringify(message));
        }
    }

    // Diffuse qu'un FUP a été traité
    broadcastFUPTreated(fupId) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            const message = {
                type: 'fup-treated',
                fupId: fupId,
                timestamp: Date.now()
            };
            this.dataChannel.send(JSON.stringify(message));
            console.log('[WebRTC] FUP traité diffusé:', fupId);
        }
    }

    // Ferme les connexions
    close() {
        if (this.dataChannel) {
            this.dataChannel.close();
        }
        if (this.localConnection) {
            this.localConnection.close();
        }
        if (this.signalingSocket) {
            this.signalingSocket.close();
        }
    }
}

window.FUPSyncManager = FUPSyncManager;
