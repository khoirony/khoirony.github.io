import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// Import Socket.io Client
import { io } from "https://cdn.socket.io/4.7.4/socket.io.esm.min.js";

// ==========================================
// 0. LOGIKA MULTIPLAYER (REAL-TIME) & CHAT
// ==========================================
const onlineCountElement = document.getElementById('online-count');
const onlineDot = document.getElementById('online-dot');
const chatInput = document.getElementById('chat-input');
const socket = io("https://3dgame-api.khoirony.fun");

let remotePlayers = {}; // Menyimpan mesh player lain

socket.on('connect', () => {
    console.log("Connected to Real-time Backend");
    onlineDot.classList.add('active');
    onlineDot.classList.remove('error');
});

socket.on('playerCountUpdate', (count) => {
    onlineCountElement.innerText = count;
});

// Sinkronisasi posisi player lain
socket.on('updatePlayers', (serverPlayers) => {
    for (let id in serverPlayers) {
        if (id === socket.id) continue; // Abaikan diri sendiri

        const pData = serverPlayers[id];

        // Jika player belum ada di dunia kita, buatkan modelnya
        if (!remotePlayers[id]) {
            remotePlayers[id] = createOtherPlayerModel();
            scene.add(remotePlayers[id]);
        }

        // Update posisi & rotasi (pakai lerp agar halus)
        remotePlayers[id].position.lerp(new THREE.Vector3(pData.position.x, pData.position.y, pData.position.z), 0.2);
        remotePlayers[id].rotation.y = pData.rotation.y;
    }

    // Hapus player yang disconnect dari layar
    for (let id in remotePlayers) {
        if (!serverPlayers[id]) {
            scene.remove(remotePlayers[id]);
            delete remotePlayers[id];
        }
    }
});

// --- PENERIMA CHAT BARU ---
socket.on('chatUpdate', (data) => {
    const targetPlayer = (data.id === socket.id) ? player : remotePlayers[data.id];
    if (targetPlayer) showChatBubble(targetPlayer, data.message);
});

const chatContainer = document.getElementById('chat-container');
const chatToggleBtn = document.getElementById('chat-toggle-btn');

// --- LOGIKA TOMBOL CHAT (TAMPILKAN) ---
chatToggleBtn.addEventListener('click', () => {
    chatToggleBtn.style.display = 'none'; // Hilangkan tombol
    chatContainer.style.display = 'block'; // Munculkan kotak input
    chatInput.focus(); // Langsung siap ngetik tanpa perlu diklik lagi
});

// --- PENGIRIM CHAT ---
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if (chatInput.value.trim() !== "") {
            socket.emit('chatMessage', chatInput.value);
        }
        // Bersihkan, sembunyikan kotak input, kembalikan tombol
        chatInput.value = "";
        chatInput.blur();
        chatContainer.style.display = 'none';
        chatToggleBtn.style.display = 'block';
    }
});

// --- TUTUP OTOMATIS JIKA TIDAK JADI NGETIK ---
// Kalau kotak chat sedang terbuka tapi user malah ngeklik area game (blur)
chatInput.addEventListener('blur', () => {
    chatContainer.style.display = 'none';
    chatToggleBtn.style.display = 'block';
});

socket.on('connect_error', () => {
    onlineCountElement.innerText = "Offline";
    onlineDot.classList.remove('active');
    onlineDot.classList.add('error');
});

socket.on('disconnect', () => {
    onlineCountElement.innerText = "Reconnecting...";
    onlineDot.classList.remove('active');
});

// Fungsi membuat "boneka" player lain (LENGKAP DENGAN TANGAN & KAKI)
function createOtherPlayerModel() {
    const group = new THREE.Group();
    group.rotation.order = 'YXZ';

    const colorBody = 0xff4444; // Warna Merah untuk orang lain
    const colorSkin = 0xffccaa; // Warna Kulit
    const colorPant = 0x550000; // Warna Celana

    // 1. Badan
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.75, 0.25), new THREE.MeshStandardMaterial({ color: colorBody }));
    b.position.y = 1.125; b.castShadow = true; group.add(b);

    // 2. Kepala
    const h = createLimb(0.5, 0.5, 0.5, colorSkin, 1.5);
    h.children[0].position.y = 0.25; group.add(h);

    // 3. Tangan (Limb)
    const aL = createLimb(0.25, 0.75, 0.25, colorSkin, 1.5); aL.position.x = 0.375;
    const aR = createLimb(0.25, 0.75, 0.25, colorSkin, 1.5); aR.position.x = -0.375;
    group.add(aL, aR);

    // 4. Kaki (Limb)
    const lL = createLimb(0.25, 0.75, 0.25, colorPant, 0.75); lL.position.x = 0.125;
    const lR = createLimb(0.25, 0.75, 0.25, colorPant, 0.75); lR.position.x = -0.125;
    group.add(lL, lR);

    // SIMPAN DATA KE USERDATA UNTUK ANIMASI
    group.userData = {
        armL: aL, armR: aR, legL: lL, legR: lR,
        moveTime: 0, lastPos: new THREE.Vector3()
    };
    
    return group;
}

// --- FUNGSI PEMBUAT BUBBLE CHAT DINAMIS (BISA MULTI-LINE) ---
function showChatBubble(targetGroup, message) {
    if (targetGroup.userData.bubble) {
        targetGroup.remove(targetGroup.userData.bubble);
        targetGroup.userData.bubble = null;
    }

    if (message === "/clear") return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const fontSize = 36;
    ctx.font = `bold ${fontSize}px Arial`;
    
    const maxWidth = 400; 
    const words = message.split(' ');
    let lines = [];
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
        const testLine = currentLine + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && i > 0) {
            lines.push(currentLine.trim());
            currentLine = words[i] + ' ';
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine.trim());

    const lineHeight = 45;
    const paddingTopBottom = 40;
    const paddingLeftRight = 60;
    
    let longestWidth = 0;
    for(let line of lines) {
        const w = ctx.measureText(line).width;
        if(w > longestWidth) longestWidth = w;
    }

    canvas.width = Math.max(256, longestWidth + paddingLeftRight);
    canvas.height = (lines.length * lineHeight) + paddingTopBottom;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.roundRect(10, 10, canvas.width - 20, canvas.height - 20, 20); 
    ctx.fill();
    ctx.strokeStyle = 'white'; 
    ctx.lineWidth = 4; 
    ctx.stroke();

    ctx.fillStyle = 'white'; 
    ctx.font = `bold ${fontSize}px Arial`; 
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const startY = (canvas.height / 2) - ((lines.length - 1) * lineHeight / 2);
    for(let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], canvas.width / 2, startY + (i * lineHeight));
    }

    const tex = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: tex });
    const sprite = new THREE.Sprite(spriteMat);
    
    const scaleFactor = 0.006;
    sprite.scale.set(canvas.width * scaleFactor, canvas.height * scaleFactor, 1);
    
    sprite.position.y = 2.8 + ((canvas.height - 128) * scaleFactor / 2); 
    
    targetGroup.add(sprite);
    targetGroup.userData.bubble = sprite;
}

// ==========================================
// 0. LOGIKA WAKTU IN-GAME
// ==========================================
let gameTime = 8 * 60; 
let gameDay = 1;
let isDay = true;
let timeSpeed = 1; 

const uiDay = document.getElementById('hud-day');
const uiClock = document.getElementById('hud-clock');
const uiPeriod = document.getElementById('hud-period');

function updateGameTime() {
    gameTime += timeSpeed;
    if (gameTime >= 24 * 60) {
        gameTime = 0;
        gameDay++;
    }

    const h = Math.floor(gameTime / 60);
    const m = Math.floor(gameTime % 60);

    let period = 'Malam';
    let newIsDay = false;

    if (h >= 6 && h < 10) { period = 'Pagi'; newIsDay = true; }
    else if (h >= 10 && h < 15) { period = 'Siang'; newIsDay = true; }
    else if (h >= 15 && h < 18) { period = 'Sore'; newIsDay = true; }
    else { period = 'Malam'; newIsDay = false; }

    if (newIsDay !== isDay && scene) {
        isDay = newIsDay;
        changeEnvironmentLight();
    }

    uiDay.innerText = `Hari ke-${gameDay}`;
    uiClock.innerText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    uiPeriod.innerText = period;
}

setInterval(updateGameTime, 1000);

// ==========================================
// 1. SETUP SCENE, CAMERA, RENDERER
// ==========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 30, 150);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(50, 100, 50);
dirLight.castShadow = true;
dirLight.shadow.camera.left = -150; dirLight.shadow.camera.right = 150;
dirLight.shadow.camera.top = 150; dirLight.shadow.camera.bottom = -150;
dirLight.shadow.camera.far = 300;
dirLight.shadow.mapSize.width = 2048; dirLight.shadow.mapSize.height = 2048;
scene.add(dirLight);

function changeEnvironmentLight() {
    if(isDay) {
        scene.background = new THREE.Color(0x87CEEB); scene.fog.color.setHex(0x87CEEB);
        dirLight.intensity = 1.0; ambientLight.intensity = 0.5; document.body.style.background = '#87CEEB';
    } else {
        scene.background = new THREE.Color(0x05051a); scene.fog.color.setHex(0x05051a);
        dirLight.intensity = 0.1; ambientLight.intensity = 0.1; document.body.style.background = '#05051a';
    }
}

// ==========================================
// 2. SISTEM FISIKA & ARRAY PENYIMPAN
// ==========================================
const solidGrounds = []; 
const wallObjects = [];  
const interactiveHouses = [];
const npcs = []; 
const beds = []; 

function addWall(mesh) { 
    mesh.updateMatrixWorld(true);
    wallObjects.push(new THREE.Box3().setFromObject(mesh)); 
}

// ==========================================
// 3. GENERATOR LINGKUNGAN ALAM & BANGUNAN
// ==========================================
const ocean = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshStandardMaterial({ color: 0x006994, transparent: true, opacity: 0.8 }));
ocean.rotation.x = -Math.PI / 2; ocean.position.y = -2;
scene.add(ocean); solidGrounds.push(ocean);

const island = new THREE.Mesh(new THREE.CylinderGeometry(150, 160, 4, 64), new THREE.MeshStandardMaterial({ color: 0x4B8B3B }));
island.position.y = -2; island.receiveShadow = true;
scene.add(island); solidGrounds.push(island);

function createHollowHouse(x, z, rotY = 0) {
    const group = new THREE.Group();
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xfff8dc });
    const width = 8, depth = 8, height = 4, thickness = 0.5;

    const floor = new THREE.Mesh(new THREE.BoxGeometry(width, 0.2, depth), new THREE.MeshStandardMaterial({ color: 0x654321 }));
    floor.position.set(0, 0.1, 0); floor.receiveShadow = true; group.add(floor);

    const wallL = new THREE.Mesh(new THREE.BoxGeometry(thickness, height, depth), wallMat); wallL.position.set(-width/2 + thickness/2, height/2, 0);
    const wallR = new THREE.Mesh(new THREE.BoxGeometry(thickness, height, depth), wallMat); wallR.position.set(width/2 - thickness/2, height/2, 0);
    const wallB = new THREE.Mesh(new THREE.BoxGeometry(width, height, thickness), wallMat); wallB.position.set(0, height/2, -depth/2 + thickness/2);
    const wallFL = new THREE.Mesh(new THREE.BoxGeometry((width - 2.5)/2, height, thickness), wallMat); wallFL.position.set(-2.625, height/2, depth/2 - thickness/2);
    const wallFR = new THREE.Mesh(new THREE.BoxGeometry((width - 2.5)/2, height, thickness), wallMat); wallFR.position.set(2.625, height/2, depth/2 - thickness/2);
    const wallFTop = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1, thickness), wallMat); wallFTop.position.set(0, 3.5, depth/2 - thickness/2);

    const walls = [wallL, wallR, wallB, wallFL, wallFR, wallFTop];
    walls.forEach(w => { w.castShadow = true; w.receiveShadow = true; group.add(w); });

    const roof = new THREE.Mesh(new THREE.ConeGeometry(7, 3, 4), new THREE.MeshStandardMaterial({ color: 0x8b0000 }));
    roof.position.set(0, height + 1.5, 0); roof.rotation.y = Math.PI / 4; roof.castShadow = true; group.add(roof);

    const bedMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a });
    const bed = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.6, 4), bedMat);
    bed.position.set(-2, 0.4, -1.5); bed.castShadow = true; group.add(bed);

    const pillow = new THREE.Mesh(new THREE.BoxGeometry(2, 0.2, 1), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    pillow.position.set(-2, 0.8, -2.8); group.add(pillow);

    const table = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 2), new THREE.MeshStandardMaterial({ color: 0x5c4033 }));
    table.position.set(2, 0.6, -2); table.castShadow = true; group.add(table);

    const indoorLight = new THREE.PointLight(0xffaa55, 1, 15); indoorLight.position.set(0, 3, 0); group.add(indoorLight);

    group.position.set(x, 0, z); group.rotation.y = rotY; scene.add(group);
    group.updateMatrixWorld(true); walls.forEach(w => addWall(w)); addWall(bed); addWall(table); solidGrounds.push(floor);

    const triggerBox = new THREE.Box3().setFromObject(floor); triggerBox.max.y += 5;
    interactiveHouses.push({ box: triggerBox, roof: roof });

    bed.updateMatrixWorld(true);
    const bedTrigger = new THREE.Box3().setFromObject(bed);
    bedTrigger.expandByScalar(1.5); 
    
    const bedCenter = new THREE.Vector3();
    bed.getWorldPosition(bedCenter);
    bedCenter.y += 0.8; 
    beds.push({ triggerBox: bedTrigger, sleepPosition: bedCenter, sleepRotY: rotY + Math.PI/2 });
}

function createTent(x, z, rotY = 0) {
    const tent = new THREE.Mesh(new THREE.ConeGeometry(2.5, 3, 4), new THREE.MeshStandardMaterial({ color: 0xFF8C00 }));
    tent.position.set(x, 1.5, z); tent.rotation.y = rotY + Math.PI / 4;
    tent.castShadow = true; tent.receiveShadow = true;
    scene.add(tent); addWall(tent); solidGrounds.push(tent);
}

function createHill(x, z, scale) {
    const hill = new THREE.Mesh(new THREE.SphereGeometry(10, 16, 16), new THREE.MeshStandardMaterial({ color: 0x55aa55 }));
    hill.position.set(x, 0, z); hill.scale.set(scale, scale * 0.4, scale); 
    hill.receiveShadow = true; scene.add(hill); solidGrounds.push(hill);
}

function createMountain(x, z) {
    const mtn = new THREE.Mesh(new THREE.ConeGeometry(40, 50, 8), new THREE.MeshStandardMaterial({ color: 0x696969 }));
    mtn.position.set(x, 25, z); mtn.castShadow = true; mtn.receiveShadow = true;
    scene.add(mtn); solidGrounds.push(mtn);
}

function createLake(x, z, radius) {
    const water = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.5, 32), new THREE.MeshStandardMaterial({ color: 0x1E90FF, transparent: true, opacity: 0.8 }));
    water.position.set(x, -0.5, z); scene.add(water); solidGrounds.push(water);
    const sand = new THREE.Mesh(new THREE.TorusGeometry(radius + 1, 1, 8, 32), new THREE.MeshStandardMaterial({ color: 0xEEDC82 }));
    sand.position.set(x, -0.2, z); sand.rotation.x = Math.PI / 2;
    scene.add(sand); solidGrounds.push(sand);
}

function createTree(x, z) {
    const trunk = new THREE.Mesh(new THREE.BoxGeometry(1, 3, 1), new THREE.MeshStandardMaterial({ color: 0x8B4513 }));
    trunk.position.set(x, 1.5, z); trunk.castShadow = true; scene.add(trunk); 
    trunk.updateMatrixWorld(true); addWall(trunk);
    const leaves = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), new THREE.MeshStandardMaterial({ color: 0x228B22 }));
    leaves.position.set(x, 4, z); leaves.castShadow = true; scene.add(leaves);
}

function createPig(x, z) {
    const pig = new THREE.Group(); 
    const mat = new THREE.MeshStandardMaterial({ color: 0xFFB6C1 });
    
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 1.2), mat); body.position.y = 0.6; body.castShadow = true;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), mat); head.position.set(0, 1, 0.6); head.castShadow = true;
    pig.add(body, head); 
    
    function createLeg(lx, lz) {
        const legGroup = new THREE.Group(); const leg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.2), mat);
        leg.position.y = -0.2; leg.castShadow = true; legGroup.add(leg); legGroup.position.set(lx, 0.4, lz);
        return legGroup;
    }
    const legFL = createLeg(0.25, 0.4); const legFR = createLeg(-0.25, 0.4);
    const legBL = createLeg(0.25, -0.4); const legBR = createLeg(-0.25, -0.4);
    pig.add(legFL, legFR, legBL, legBR);
    
    pig.position.set(x, 0, z); pig.rotation.y = Math.random() * Math.PI * 2; scene.add(pig); 
    
    npcs.push({
        mesh: pig, legs: [legFL, legFR, legBL, legBR],
        state: 'idle', timer: Math.random() * 2, moveTime: 0, velocityY: 0, speed: 0.03 + Math.random() * 0.02, direction: pig.rotation.y
    });
}

function createMading(title, lines, x, z, rotY = 0) {
    const group = new THREE.Group();
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x3d2314 }); 
    const poleL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4, 0.4), poleMat); poleL.position.set(-2.2, 2, 0); poleL.castShadow = true;
    const poleR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4, 0.4), poleMat); poleR.position.set(2.2, 2, 0); poleR.castShadow = true;
    group.add(poleL, poleR);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.3, 1.2), new THREE.MeshStandardMaterial({ color: 0x2b170b }));
    roof.position.set(0, 4.1, 0.1); roof.rotation.x = Math.PI / 16; roof.castShadow = true; group.add(roof);
    group.add(new THREE.PointLight(0xffddaa, 1.5, 15).position.set(0, 3.5, 2));

    const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 512; const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#ffffff'); gradient.addColorStop(1, '#fef3c7'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#b45309'; ctx.lineWidth = 15; ctx.strokeRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#dc2626'; [[35,35], [989,35], [35,477], [989,477]].forEach(pos => { ctx.beginPath(); ctx.arc(pos[0], pos[1], 10, 0, Math.PI * 2); ctx.fill(); });
    ctx.fillStyle = '#991b1b'; ctx.font = '900 55px "Segoe UI", Arial, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(title, canvas.width / 2, 85);
    ctx.beginPath(); ctx.moveTo(250, 110); ctx.lineTo(774, 110); ctx.lineWidth = 4; ctx.strokeStyle = '#d97706'; ctx.stroke();
    ctx.fillStyle = '#1e293b'; ctx.font = 'bold 34px "Segoe UI", Arial, sans-serif'; ctx.textAlign = 'left';
    let startY = 180; lines.forEach(l => { ctx.fillText(l, 80, startY); startY += 60; });

    const texture = new THREE.CanvasTexture(canvas); texture.needsUpdate = true; texture.colorSpace = THREE.SRGBColorSpace; 
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xdeb887 });
    const board = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.4, 0.1), [woodMat, woodMat, woodMat, woodMat, new THREE.MeshStandardMaterial({ map: texture }), woodMat]);
    board.position.set(0, 2.2, 0.15); board.castShadow = true;
    
    group.add(board); group.position.set(x, 0, z); group.rotation.y = rotY; scene.add(group); 
    group.updateMatrixWorld(true); addWall(group); solidGrounds.push(board, roof); 
}

// ==========================================
// 4. PENYUSUNAN DUNIA
// ==========================================
createMading("✨ ABOUT ME ✨", ["👋 Hi! I am Khoirony Arief", "💻 Software Engineer based in Bandung.", "🏢 Working at Far Capital (Property Tech).", "🚀 Fast Learner & Problem Solver."], 0, -10, 0);
createHollowHouse(-25, -15, Math.PI / 4);  
createHollowHouse(-15, -25, -Math.PI / 6); 
createTent(-35, -5, 0);
createMading("🛠️ TECH SKILLS", ["⚡ TALL Stack: Tailwind, AlpineJS, Laravel, Livewire", "🧩 No-Code: Bubble.io, Make, n8n", "☁️ Cloud/Deploy: VPS, Docker, AWS S3, CI/CD", "🎮 Game Dev: Unity, C#, 3D Math"], -20, -5, Math.PI / 3);
createLake(35, 10, 15);
createTent(45, 20, -Math.PI/4);
createMading("🏢 WORK EXPERIENCE", ["▪ Far Capital (Property HUB) - Full-time", "   Built platforms for property buying & agents.", "▪ Far Capital (Wetopia & Matchbank)", "   Fintech screening & short-term rentals.", "▪ Govt of Jakarta - Freelance", "   Marine Fuel Monitoring System Dashboard."], 25, 5, -Math.PI / 4);
createMountain(0, -80); createMountain(80, -40); createHill(15, -45, 1.5); createHill(-30, 20, 2);
createMading("🏆 WEEKEND PROJECTS", ["1️⃣ Personal Profile Game (WebGL / Unity)", "    Interactive 3D Portfolio Experience.", "2️⃣ Fintrac (Financial Report System)", "    Cash flow tracker for FIRE planning.", "3️⃣ Object Detection (Tensorflow JS)", "    Real-time browser computer vision."], 0, -35, 0);

for (let i = 0; i < 100; i++) {
    let x = (Math.random() - 0.5) * 250; let z = (Math.random() - 0.5) * 250;
    if (Math.sqrt(x*x + z*z) > 15 && (x > -15 || x < -35) && (x < 20 || x > 50)) createTree(x, z);
}
for (let i = 0; i < 25; i++) {
    let x = (Math.random() - 0.5) * 150; let z = (Math.random() - 0.5) * 150;
    if (Math.sqrt(x*x + z*z) > 10) createPig(x, z);
}

// ==========================================
// 5. KARAKTER PEMAIN & KONTROL
// ==========================================
const player = new THREE.Group(); scene.add(player); 
player.position.set(0, 5, 5);
player.rotation.order = 'YXZ'; 
player.userData = {}; // Persiapan untuk bubble lokal player

function createLimb(w, h, d, color, yPivot) {
    const group = new THREE.Group(); const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: color }));
    mesh.castShadow = true; mesh.position.y = -h / 2; group.add(mesh); group.position.y = yPivot; return group;
}

const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.75, 0.25), new THREE.MeshStandardMaterial({ color: 0x00aaff })); body.position.y = 1.125; body.castShadow = true; player.add(body);
const head = createLimb(0.5, 0.5, 0.5, 0xffccaa, 1.5); head.children[0].position.y = 0.25; player.add(head);
const armL = createLimb(0.25, 0.75, 0.25, 0xffccaa, 1.5); armL.position.x = 0.375; player.add(armL);
const armR = createLimb(0.25, 0.75, 0.25, 0xffccaa, 1.5); armR.position.x = -0.375; player.add(armR);
const legL = createLimb(0.25, 0.75, 0.25, 0x0000aa, 0.75); legL.position.x = 0.125; player.add(legL);
const legR = createLimb(0.25, 0.75, 0.25, 0x0000aa, 0.75); legR.position.x = -0.125; player.add(legR);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.maxPolarAngle = Math.PI / 2.1; controls.minDistance = 2; controls.maxDistance = 20;

let velocityY = 0; const gravity = -0.02; let isJumping = false;
let moveTime = 0; const playerBox = new THREE.Box3();
const raycaster = new THREE.Raycaster(); 

const keys = { w: false, a: false, s: false, d: false, ' ': false };
window.addEventListener('keydown', (e) => { 
    // Jangan halangi mengetik kalau sedang fokus di chat input
    if(document.activeElement === chatInput) return;
    if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = true; 
});
window.addEventListener('keyup', (e) => { 
    if(document.activeElement === chatInput) return;
    if (keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = false; 
});

let joyX = 0, joyY = 0, isJoyActive = false;
const joystickManager = nipplejs.create({ zone: document.getElementById('joystick-zone'), mode: 'static', position: { left: '50%', top: '50%' }, color: 'white' });
joystickManager.on('move', (evt, data) => { isJoyActive = true; joyX = data.vector.x; joyY = data.vector.y; });
joystickManager.on('end', () => { isJoyActive = false; joyX = 0; joyY = 0; });

const jumpBtn = document.getElementById('jump-btn');
const triggerJump = (e) => { e.preventDefault(); if (!isJumping && !isSleeping) { velocityY = 0.3; isJumping = true; } };
jumpBtn.addEventListener('touchstart', triggerJump, { passive: false });
jumpBtn.addEventListener('mousedown', triggerJump);

// ==========================================
// 6. SISTEM SMART ACTION (TIDUR & RIDING)
// ==========================================
const actionBtn = document.getElementById('action-btn');
const fadeOverlay = document.getElementById('fade-overlay');

let activeBed = null;
let activePig = null;

let isSleeping = false;
let previousPlayerPos = new THREE.Vector3();
let previousPlayerRot = new THREE.Euler();

let isRiding = false;
let mountedPig = null;

actionBtn.addEventListener('click', () => {
    if (isRiding) {
        isRiding = false;
        mountedPig.state = 'idle'; 
        mountedPig = null;
        player.position.x += 1; 
        player.position.y += 0.5;
        actionBtn.style.display = 'none';
        return;
    }

    if(!isSleeping && activeBed) {
        isSleeping = true;
        actionBtn.style.display = 'none';
        previousPlayerPos.copy(player.position);
        previousPlayerRot.copy(player.rotation);

        player.position.copy(activeBed.sleepPosition);
        player.rotation.set(-Math.PI / 2, 0, activeBed.sleepRotY);
        velocityY = 0;

        fadeOverlay.style.opacity = 1;
        setTimeout(() => {
            
            // PERCEPAT WAKTU (TIME SKIP)
            if (isDay) {
                gameTime = 18 * 60; // Jam 18:00
                isDay = false;
            } else {
                gameTime = 6 * 60; // Jam 06:00
                gameDay++;
                isDay = true;
            }
            changeEnvironmentLight();

            setTimeout(() => {
                fadeOverlay.style.opacity = 0;
                player.position.copy(previousPlayerPos);
                player.rotation.copy(previousPlayerRot);
                isSleeping = false;
            }, 1500);
        }, 1500);
        return;
    }

    if(!isSleeping && activePig) {
        isRiding = true;
        mountedPig = activePig;
        mountedPig.state = 'ridden'; 
        return;
    }
});

// ==========================================
// 7. GAME LOOP UTAMA
// ==========================================
function animate() {
    requestAnimationFrame(animate);
    const currentSpeed = isRiding ? 0.45 : 0.25;

    npcs.forEach(npc => {
        if (npc.state === 'ridden') return;

        npc.timer -= 0.016; 
        if (npc.timer <= 0) {
            npc.state = Math.random() > 0.5 ? 'walking' : 'idle';
            npc.timer = 1 + Math.random() * 4; 
            if (npc.state === 'walking') npc.direction = Math.random() * Math.PI * 2;
            if (Math.random() > 0.8 && npc.velocityY === 0) npc.velocityY = 0.2; 
        }

        let npcGroundY = -5;
        raycaster.set(new THREE.Vector3(npc.mesh.position.x, npc.mesh.position.y + 1, npc.mesh.position.z), new THREE.Vector3(0, -1, 0));
        let npcIntersects = raycaster.intersectObjects(solidGrounds, false);
        if (npcIntersects.length > 0) npcGroundY = npcIntersects[0].point.y;

        npc.velocityY += gravity; 
        npc.mesh.position.y += npc.velocityY;
        if (npc.mesh.position.y <= npcGroundY) { npc.mesh.position.y = npcGroundY; npc.velocityY = 0; }

        if (npc.state === 'walking') {
            let diff = npc.direction - npc.mesh.rotation.y;
            diff = Math.atan2(Math.sin(diff), Math.cos(diff));
            npc.mesh.rotation.y += diff * 0.05;
            npc.mesh.translateZ(npc.speed);

            npc.moveTime += 0.25;
            npc.legs[0].rotation.x = Math.sin(npc.moveTime) * 0.5; npc.legs[3].rotation.x = Math.sin(npc.moveTime) * 0.5; 
            npc.legs[1].rotation.x = -Math.sin(npc.moveTime) * 0.5; npc.legs[2].rotation.x = -Math.sin(npc.moveTime) * 0.5; 
        } else {
            npc.legs.forEach(leg => leg.rotation.x = THREE.MathUtils.lerp(leg.rotation.x, 0, 0.1));
        }
    });

    let isInsideHouse = false;
    for (let house of interactiveHouses) {
        if (house.box.containsPoint(player.position)) {
            house.roof.visible = false; isInsideHouse = true;
        } else {
            house.roof.visible = true; 
        }
    }
    if (isInsideHouse) controls.maxDistance = 5; else controls.maxDistance = 20;

    if (!isSleeping) {
        activeBed = null;
        activePig = null;

        if (isRiding) {
            actionBtn.style.display = 'block';
            actionBtn.innerHTML = '🚶 Turun';
        } else {
            for (let bed of beds) {
                if (bed.triggerBox.containsPoint(player.position)) {
                    activeBed = bed; break;
                }
            }
            if (!activeBed) {
                for (let npc of npcs) {
                    if (player.position.distanceTo(npc.mesh.position) < 3.0) {
                        activePig = npc; break;
                    }
                }
            }

            if (activeBed) { actionBtn.style.display = 'block'; actionBtn.innerHTML = '💤 Tidur'; } 
            else if (activePig) { actionBtn.style.display = 'block'; actionBtn.innerHTML = '🐎 Naik'; } 
            else { actionBtn.style.display = 'none'; }
        }
    }

    if (!isSleeping) {
        let currentGroundY = -5;
        raycaster.set(new THREE.Vector3(player.position.x, player.position.y + 1, player.position.z), new THREE.Vector3(0, -1, 0));
        let intersects = raycaster.intersectObjects(solidGrounds, false);
        if (intersects.length > 0) currentGroundY = intersects[0].point.y;

        let targetY = isRiding ? currentGroundY + 1.0 : currentGroundY;

        velocityY += gravity; 
        player.position.y += velocityY;
        if (player.position.y <= targetY) { 
            player.position.y = targetY; velocityY = 0; isJumping = false; 
        }
        
        if (keys[' '] && !isJumping) { velocityY = 0.35; isJumping = true; }

        const camForward = new THREE.Vector3(); camera.getWorldDirection(camForward);
        camForward.y = 0; camForward.normalize();
        const camRight = new THREE.Vector3(-camForward.z, 0, camForward.x); 

        let inputY = (keys.w ? 1 : 0) - (keys.s ? 1 : 0);
        let inputX = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
        if (isJoyActive) { inputY += joyY; inputX += joyX; }

        const moveDir = new THREE.Vector3();
        if (inputY !== 0) moveDir.addScaledVector(camForward, inputY);
        if (inputX !== 0) moveDir.addScaledVector(camRight, inputX);
        if (moveDir.lengthSq() > 1) moveDir.normalize();

        if (moveDir.lengthSq() > 0) {
            const nextPos = player.position.clone().addScaledVector(moveDir, currentSpeed);
            let isColliding = false;

            playerBox.min.set(nextPos.x - 0.25, player.position.y, nextPos.z - 0.25);
            playerBox.max.set(nextPos.x + 0.25, player.position.y + 1.5, nextPos.z + 0.25);
            for (let box of wallObjects) {
                if (playerBox.intersectsBox(box)) { isColliding = true; break; }
            }

            if (!isColliding) {
                for (let npc of npcs) {
                    if (npc === mountedPig) continue;
                    let npcBox = new THREE.Box3().setFromObject(npc.mesh);
                    npcBox.expandByScalar(-0.1); 
                    if (playerBox.intersectsBox(npcBox)) { isColliding = true; break; }
                }
            }

            if (!isColliding) {
                player.position.x = nextPos.x;
                player.position.z = nextPos.z;
            }
            
            player.rotation.x = 0;
            player.lookAt(player.position.clone().add(moveDir));
            
            if (isRiding) {
                armL.rotation.x = 0.4; armR.rotation.x = 0.4;
                legL.rotation.x = -0.4; legR.rotation.x = -0.4;
                legL.rotation.z = -0.2; legR.rotation.z = 0.2;
                
                mountedPig.moveTime += 0.4; 
                mountedPig.legs[0].rotation.x = Math.sin(mountedPig.moveTime) * 0.8; 
                mountedPig.legs[3].rotation.x = Math.sin(mountedPig.moveTime) * 0.8; 
                mountedPig.legs[1].rotation.x = -Math.sin(mountedPig.moveTime) * 0.8; 
                mountedPig.legs[2].rotation.x = -Math.sin(mountedPig.moveTime) * 0.8; 
            } else {
                moveTime += (0.25 * (isJoyActive ? Math.max(Math.abs(joyX), Math.abs(joyY)) : 1)); 
                armL.rotation.x = Math.sin(moveTime) * 0.8; armR.rotation.x = -Math.sin(moveTime) * 0.8;
                legL.rotation.x = -Math.sin(moveTime) * 0.8; legR.rotation.x = Math.sin(moveTime) * 0.8;
                legL.rotation.z = 0; legR.rotation.z = 0;
            }

        } else {
            player.rotation.x = 0;
            if (isRiding) {
                armL.rotation.x = 0.4; armR.rotation.x = 0.4;
                legL.rotation.x = -0.4; legR.rotation.x = -0.4;
                mountedPig.legs.forEach(leg => leg.rotation.x = THREE.MathUtils.lerp(leg.rotation.x, 0, 0.1));
            } else {
                armL.rotation.x = THREE.MathUtils.lerp(armL.rotation.x, 0, 0.1); armR.rotation.x = THREE.MathUtils.lerp(armR.rotation.x, 0, 0.1);
                legL.rotation.x = THREE.MathUtils.lerp(legL.rotation.x, 0, 0.1); legR.rotation.x = THREE.MathUtils.lerp(legR.rotation.x, 0, 0.1);
                legL.rotation.z = 0; legR.rotation.z = 0;
            }
        }

        if (isRiding && mountedPig) {
            mountedPig.mesh.position.set(player.position.x, player.position.y - 1.0, player.position.z);
            mountedPig.mesh.rotation.y = player.rotation.y;
        }
    } 

    // --- ANIMASI PLAYER LAIN (MMO) ---
    for (let id in remotePlayers) {
        const p = remotePlayers[id];
        const anim = p.userData;

        // Cek apakah player lain bergerak dengan membandingkan posisi sekarang vs posisi frame sebelumnya
        const distanceMoved = p.position.distanceTo(anim.lastPos);
        const isMoving = distanceMoved > 0.01; 

        if (isMoving) {
            anim.moveTime += 0.2; 
            const mt = anim.moveTime;

            anim.armL.rotation.x = Math.sin(mt) * 0.8;
            anim.armR.rotation.x = -Math.sin(mt) * 0.8;
            anim.legL.rotation.x = -Math.sin(mt) * 0.8;
            anim.legR.rotation.x = Math.sin(mt) * 0.8;
        } else {
            anim.armL.rotation.x = THREE.MathUtils.lerp(anim.armL.rotation.x, 0, 0.1);
            anim.armR.rotation.x = THREE.MathUtils.lerp(anim.armR.rotation.x, 0, 0.1);
            anim.legL.rotation.x = THREE.MathUtils.lerp(anim.legL.rotation.x, 0, 0.1);
            anim.legR.rotation.x = THREE.MathUtils.lerp(anim.legR.rotation.x, 0, 0.1);
        }
        anim.lastPos.copy(p.position);
    }

    controls.target.set(player.position.x, player.position.y + 1.5, player.position.z);
    controls.update();
    renderer.render(scene, camera);
}

// --- LOOP PENGIRIMAN POSISI KE SERVER (MMO LOGIC) ---
setInterval(() => {
    if (socket.connected) {
        socket.emit('move', {
            position: { x: player.position.x, y: player.position.y, z: player.position.z },
            rotation: { y: player.rotation.y }
        });
    }
}, 50); 

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});