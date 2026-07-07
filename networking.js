// networking.js
import * as THREE from 'three';
import { io } from "https://cdn.socket.io/4.7.4/socket.io.esm.min.js";

export const remotePlayers = {};

let myPlayerId = localStorage.getItem('mmo_player_id');
if (!myPlayerId) { 
    myPlayerId = 'player_' + Math.random().toString(36).substr(2, 9); 
    localStorage.setItem('mmo_player_id', myPlayerId); 
}
let myUsername = localStorage.getItem('mmo_username') || "";

export const socket = io("https://3dgame-api.khoirony.com", { query: { playerId: myPlayerId } });

const onlineCountElement = document.getElementById('online-count');
const onlineDot = document.getElementById('online-dot');
const chatInput = document.getElementById('chat-input');
const chatContainer = document.getElementById('chat-container');
const chatToggleBtn = document.getElementById('chat-toggle-btn');

export function initNetworking(scene, localPlayer) {
    const loginOverlay = document.getElementById('login-overlay');
    const usernameInput = document.getElementById('username-input');
    const playBtn = document.getElementById('play-btn');
    const updateNameBtn = document.getElementById('update-name-btn'); // Tangkap elemen tombol baru

    // Tampilkan nama lama di kotak input (jika ada)
    if (myUsername) usernameInput.value = myUsername;

    if (myUsername) {
        loginOverlay.style.display = 'none';
        socket.on('connect', () => {
            socket.emit('setUsername', myUsername);
        });
    } else {
        loginOverlay.style.display = 'flex';
    }

    playBtn.addEventListener('click', () => {
        let name = usernameInput.value.trim();
        if (name === "") name = "Guest_" + Math.floor(Math.random() * 1000);
        
        localStorage.setItem('mmo_username', name);
        myUsername = name; // Update memori lokal
        socket.emit('setUsername', name);
        loginOverlay.style.display = 'none';
    });

    // EVENT SAAT TOMBOL "CHANGE NAME" DIKLIK
    if (updateNameBtn) {
        updateNameBtn.addEventListener('click', () => {
            usernameInput.value = myUsername; // Isi dengan nama saat ini
            loginOverlay.style.display = 'flex'; // Tampilkan kembali kotaknya
        });
    }

    socket.on('connect', () => { onlineDot.classList.add('active'); onlineDot.classList.remove('error'); });
    socket.on('playerCountUpdate', (count) => { onlineCountElement.innerText = count; });

    socket.on('updatePlayers', (serverPlayers) => {
        for (let id in serverPlayers) {
            if (id === socket.id) continue;
            const pData = serverPlayers[id];

            if (!remotePlayers[id]) {
                remotePlayers[id] = createOtherPlayerModel();
                scene.add(remotePlayers[id]);
            }

            remotePlayers[id].position.lerp(new THREE.Vector3(pData.position.x, pData.position.y, pData.position.z), 0.2);
            remotePlayers[id].rotation.y = pData.rotation.y;

            if (pData.username && remotePlayers[id].userData.currentUsername !== pData.username) {
                remotePlayers[id].userData.currentUsername = pData.username;
                updateNametag(remotePlayers[id], pData.username);
            }

            if (pData.lastMessage && pData.lastMessage !== "" && pData.lastMessage !== "/clear") {
                const currentBubbleMsg = remotePlayers[id].userData.currentMessage;
                if (currentBubbleMsg !== pData.lastMessage) { showChatBubble(remotePlayers[id], pData.lastMessage); }
            } else if (pData.lastMessage === "/clear" && remotePlayers[id].userData.bubble) {
                remotePlayers[id].remove(remotePlayers[id].userData.bubble);
                remotePlayers[id].userData.bubble = null;
                remotePlayers[id].userData.currentMessage = "";
            }
        }
        for (let id in remotePlayers) {
            if (!serverPlayers[id]) { scene.remove(remotePlayers[id]); delete remotePlayers[id]; }
        }
    });

    socket.on('chatUpdate', (data) => {
        const targetPlayer = (data.id === socket.id) ? localPlayer : remotePlayers[data.id];
        if (targetPlayer) showChatBubble(targetPlayer, data.message);
    });

    chatToggleBtn.addEventListener('click', () => { chatToggleBtn.style.display = 'none'; chatContainer.style.display = 'block'; chatInput.focus(); });
    chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { if (chatInput.value.trim() !== "") { socket.emit('chatMessage', chatInput.value); } chatInput.value = ""; chatInput.blur(); chatContainer.style.display = 'none'; chatToggleBtn.style.display = 'block'; } });
    chatInput.addEventListener('blur', () => { chatContainer.style.display = 'none'; chatToggleBtn.style.display = 'block'; });

    socket.on('connect_error', () => { onlineCountElement.innerText = "Offline"; onlineDot.classList.remove('active'); onlineDot.classList.add('error'); });
    socket.on('disconnect', () => { onlineCountElement.innerText = "Reconnecting..."; onlineDot.classList.remove('active'); });
    
    setInterval(() => {
        if (socket.connected && loginOverlay.style.display === 'none') {
            socket.emit('move', { position: { x: localPlayer.position.x, y: localPlayer.position.y, z: localPlayer.position.z }, rotation: { y: localPlayer.rotation.y } });
        }
    }, 50);
}

function createLimb(w, h, d, color, yPivot) { const group = new THREE.Group(); const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: color })); mesh.castShadow = true; mesh.position.y = -h / 2; group.add(mesh); group.position.y = yPivot; return group; }
function createOtherPlayerModel() {
    const group = new THREE.Group(); group.rotation.order = 'YXZ';
    const colorBody = 0xff4444; const colorSkin = 0xffccaa; const colorPant = 0x550000;
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.75, 0.25), new THREE.MeshStandardMaterial({ color: colorBody })); b.position.y = 1.125; b.castShadow = true; group.add(b);
    const h = createLimb(0.5, 0.5, 0.5, colorSkin, 1.5); h.children[0].position.y = 0.25; group.add(h);
    const aL = createLimb(0.25, 0.75, 0.25, colorSkin, 1.5); aL.position.x = 0.375; const aR = createLimb(0.25, 0.75, 0.25, colorSkin, 1.5); aR.position.x = -0.375; group.add(aL, aR);
    const lL = createLimb(0.25, 0.75, 0.25, colorPant, 0.75); lL.position.x = 0.125; const lR = createLimb(0.25, 0.75, 0.25, colorPant, 0.75); lR.position.x = -0.125; group.add(lL, lR);
    group.userData = { armL: aL, armR: aR, legL: lL, legR: lR, moveTime: 0, lastPos: new THREE.Vector3(), currentMessage: "", currentUsername: "" };
    return group;
}
function updateNametag(targetGroup, name) {
    if (targetGroup.userData.nametag) { targetGroup.remove(targetGroup.userData.nametag); }
    const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d'); ctx.font = 'bold 36px Arial'; const textWidth = ctx.measureText(name).width;
    canvas.width = Math.max(128, textWidth + 40); canvas.height = 50; ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; ctx.roundRect(0, 0, canvas.width, canvas.height, 10); ctx.fill();
    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 36px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(name, canvas.width / 2, canvas.height / 2);
    const tex = new THREE.CanvasTexture(canvas); const spriteMat = new THREE.SpriteMaterial({ map: tex }); const sprite = new THREE.Sprite(spriteMat);
    const scaleFactor = 0.01; sprite.scale.set(canvas.width * scaleFactor, canvas.height * scaleFactor, 1); sprite.position.y = 2.1; targetGroup.add(sprite); targetGroup.userData.nametag = sprite;
}
function showChatBubble(targetGroup, message) {
    if (targetGroup.userData.bubble) { targetGroup.remove(targetGroup.userData.bubble); targetGroup.userData.bubble = null; }
    if (message === "/clear") { targetGroup.userData.currentMessage = ""; return; }
    const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d'); const fontSize = 36; ctx.font = `bold ${fontSize}px Arial`;
    const maxWidth = 400; const words = message.split(' '); let lines = []; let currentLine = '';
    for (let i = 0; i < words.length; i++) { const testLine = currentLine + words[i] + ' '; const metrics = ctx.measureText(testLine); if (metrics.width > maxWidth && i > 0) { lines.push(currentLine.trim()); currentLine = words[i] + ' '; } else { currentLine = testLine; } } lines.push(currentLine.trim());
    const lineHeight = 45; const paddingTopBottom = 40; const paddingLeftRight = 60; let longestWidth = 0; for(let line of lines) { const w = ctx.measureText(line).width; if(w > longestWidth) longestWidth = w; }
    canvas.width = Math.max(256, longestWidth + paddingLeftRight); canvas.height = (lines.length * lineHeight) + paddingTopBottom;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; ctx.roundRect(10, 10, canvas.width - 20, canvas.height - 20, 20); ctx.fill(); ctx.strokeStyle = '#ccc'; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = '#000'; ctx.font = `bold ${fontSize}px Arial`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const startY = (canvas.height / 2) - ((lines.length - 1) * lineHeight / 2); for(let i = 0; i < lines.length; i++) { ctx.fillText(lines[i], canvas.width / 2, startY + (i * lineHeight)); }
    const tex = new THREE.CanvasTexture(canvas); const spriteMat = new THREE.SpriteMaterial({ map: tex }); const sprite = new THREE.Sprite(spriteMat);
    const scaleFactor = 0.006; sprite.scale.set(canvas.width * scaleFactor, canvas.height * scaleFactor, 1); sprite.position.y = 2.8 + ((canvas.height - 128) * scaleFactor / 2); targetGroup.add(sprite); targetGroup.userData.bubble = sprite; targetGroup.userData.currentMessage = message; 
}