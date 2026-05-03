// game.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createWorld, solidGrounds, wallObjects, interactiveHouses, beds, shops, createPigMesh, createTreeMesh, createTorchMesh, createMadingMesh } from './environment.js';
import { initNetworking, remotePlayers, socket } from './networking.js';

const scene = new THREE.Scene(); scene.background = new THREE.Color(0x87CEEB); scene.fog = new THREE.Fog(0x87CEEB, 30, 150);
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000); camera.position.set(0, 5, 10);
const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setSize(window.innerWidth, window.innerHeight); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 1.0); dirLight.position.set(50, 100, 50); dirLight.castShadow = true; dirLight.shadow.camera.left = -150; dirLight.shadow.camera.right = 150; dirLight.shadow.camera.top = 150; dirLight.shadow.camera.bottom = -150; dirLight.shadow.mapSize.width = 2048; dirLight.shadow.mapSize.height = 2048; scene.add(dirLight);

createWorld(scene);

const player = new THREE.Group(); scene.add(player); player.position.set(0, 5, 5); player.rotation.order = 'YXZ'; player.userData = {}; 
function createLimb(w, h, d, color, yPivot) { const group = new THREE.Group(); const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: color })); mesh.castShadow = true; mesh.position.y = -h / 2; group.add(mesh); group.position.y = yPivot; return group; }
const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.75, 0.25), new THREE.MeshStandardMaterial({ color: 0x00aaff })); body.position.y = 1.125; body.castShadow = true; player.add(body);
const head = createLimb(0.5, 0.5, 0.5, 0xffccaa, 1.5); head.children[0].position.y = 0.25; player.add(head);
const armL = createLimb(0.25, 0.75, 0.25, 0xffccaa, 1.5); armL.position.x = 0.375; player.add(armL); 
const armR = createLimb(0.25, 0.75, 0.25, 0xffccaa, 1.5); armR.position.x = -0.375; player.add(armR);
const legL = createLimb(0.25, 0.75, 0.25, 0x0000aa, 0.75); legL.position.x = 0.125; player.add(legL); 
const legR = createLimb(0.25, 0.75, 0.25, 0x0000aa, 0.75); legR.position.x = -0.125; player.add(legR);

const fishingRod = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 2.5), new THREE.MeshStandardMaterial({ color: 0x5c4033 }));
fishingRod.position.set(0, -0.7, 1); fishingRod.visible = false; armR.add(fishingRod);

const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.maxPolarAngle = Math.PI / 2.1; controls.minDistance = 2; controls.maxDistance = 20;
let velocityY = 0; const gravity = -0.02; let isJumping = false; let moveTime = 0; const playerBox = new THREE.Box3(); const raycaster = new THREE.Raycaster(); 

const keys = { w: false, a: false, s: false, d: false, ' ': false }; const chatInput = document.getElementById('chat-input');
window.addEventListener('keydown', (e) => { if(document.activeElement !== chatInput && keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = true; });
window.addEventListener('keyup', (e) => { if(document.activeElement !== chatInput && keys.hasOwnProperty(e.key.toLowerCase())) keys[e.key.toLowerCase()] = false; });
let joyX = 0, joyY = 0, isJoyActive = false; const joystickManager = nipplejs.create({ zone: document.getElementById('joystick-zone'), mode: 'static', position: { left: '50%', top: '50%' }, color: 'white' }); joystickManager.on('move', (evt, data) => { isJoyActive = true; joyX = data.vector.x; joyY = data.vector.y; }); joystickManager.on('end', () => { isJoyActive = false; joyX = 0; joyY = 0; });
const jumpBtn = document.getElementById('jump-btn'); const triggerJump = (e) => { e.preventDefault(); if (!isJumping && !isSleeping && !isFishing && !isDrowning) { velocityY = 0.3; isJumping = true; } }; jumpBtn.addEventListener('touchstart', triggerJump, { passive: false }); jumpBtn.addEventListener('mousedown', triggerJump);

initNetworking(scene, player);

let localPigs = {}; let localItems = {}; let carriedItemId = null; 
let localStats = { coins: 0, fish: 0 }; let isFishing = false; 
let isDrowning = false; 
const uiCoins = document.getElementById('ui-coins'); const uiFish = document.getElementById('ui-fish');

const minimapCanvas = document.getElementById('minimap'); const mapCtx = minimapCanvas.getContext('2d');
function updateMinimap() {
    if (!mapCtx) return; mapCtx.clearRect(0, 0, 120, 120);
    mapCtx.fillStyle = '#4B8B3B'; mapCtx.beginPath(); mapCtx.arc(60, 60, 60, 0, Math.PI * 2); mapCtx.fill();
    mapCtx.fillStyle = '#1E90FF'; mapCtx.beginPath(); mapCtx.arc(35 * 0.4 + 60, 15 * 0.4 + 60, 15 * 0.4, 0, Math.PI * 2); mapCtx.fill();
    mapCtx.fillStyle = '#8b0000'; mapCtx.fillRect(-25 * 0.4 + 60 - 3, -15 * 0.4 + 60 - 3, 6, 6); mapCtx.fillRect(-15 * 0.4 + 60 - 3, -25 * 0.4 + 60 - 3, 6, 6);
    mapCtx.fillStyle = '#FF8C00'; mapCtx.beginPath(); mapCtx.arc(-35 * 0.4 + 60, -5 * 0.4 + 60, 3, 0, Math.PI*2); mapCtx.fill(); mapCtx.beginPath(); mapCtx.arc(45 * 0.4 + 60, 20 * 0.4 + 60, 3, 0, Math.PI*2); mapCtx.fill();
    mapCtx.fillStyle = '#00ffff'; mapCtx.fillRect(20 * 0.4 + 60 - 4, 25 * 0.4 + 60 - 4, 8, 8); 
    const px = player.position.x * 0.4 + 60; const pz = player.position.z * 0.4 + 60; mapCtx.fillStyle = 'red'; mapCtx.beginPath(); mapCtx.arc(px, pz, 3, 0, Math.PI * 2); mapCtx.fill();
    const dir = new THREE.Vector3(); player.getWorldDirection(dir); mapCtx.strokeStyle = 'white'; mapCtx.lineWidth = 2; mapCtx.beginPath(); mapCtx.moveTo(px, pz); mapCtx.lineTo(px + dir.x * 6, pz + dir.z * 6); mapCtx.stroke();
}

socket.on('updatePlayers', (serverPlayers) => {
    if (serverPlayers[socket.id]) { localStats.coins = serverPlayers[socket.id].coins; localStats.fish = serverPlayers[socket.id].fish; uiCoins.innerText = localStats.coins; uiFish.innerText = localStats.fish; }
});
socket.on('initItems', (serverItems) => {
    for (let id in serverItems) { let d = serverItems[id]; let objMesh; if (d.type === 'tree') objMesh = createTreeMesh(); else if (d.type === 'torch') objMesh = createTorchMesh(); else if (d.type === 'mading') objMesh = createMadingMesh(d.title, d.lines); let groupToSpawn = (d.type === 'torch') ? objMesh.mesh : objMesh; scene.add(groupToSpawn); localItems[id] = { id: id, type: d.type, group: groupToSpawn, torchData: (d.type === 'torch') ? objMesh : null, carriedBy: d.carriedBy, targetX: d.x, targetZ: d.z, targetRotY: d.rotY }; }
});
socket.on('updateItem', (data) => { let item = localItems[data.id]; if (item) { item.carriedBy = data.data.carriedBy; item.targetX = data.data.x; item.targetZ = data.data.z; item.targetRotY = data.data.rotY; } });
socket.on('updateNPCs', (serverPigs) => {
    for (let id in serverPigs) { let sPig = serverPigs[id]; if (!localPigs[id]) { let pigObj = createPigMesh(); scene.add(pigObj.mesh); localPigs[id] = { ...pigObj, id: id, targetX: sPig.x, targetZ: sPig.z, targetRotY: sPig.rotationY, state: sPig.state, moveTime: 0, velocityY: 0 }; localPigs[id].mesh.position.set(sPig.x, 0, sPig.z); } localPigs[id].targetX = sPig.x; localPigs[id].targetZ = sPig.z; localPigs[id].targetRotY = sPig.rotationY; localPigs[id].state = sPig.state; localPigs[id].riddenBy = sPig.riddenBy; }
});

let isDay = true; const uiDay = document.getElementById('hud-day'); const uiClock = document.getElementById('hud-clock'); const uiPeriod = document.getElementById('hud-period');
socket.on('timeUpdate', (data) => {
    const h = Math.floor(data.gameTime / 60); const m = Math.floor(data.gameTime % 60); let period = 'Night'; let newIsDay = false;
    if (h >= 6 && h < 10) { period = 'Morning'; newIsDay = true; } else if (h >= 10 && h < 15) { period = 'Afternoon'; newIsDay = true; } else if (h >= 15 && h < 18) { period = 'Evening'; newIsDay = true; } else { period = 'Night'; newIsDay = false; }
    if (newIsDay !== isDay && scene) {
        isDay = newIsDay;
        if(isDay) { scene.background = new THREE.Color(0x87CEEB); scene.fog.color.setHex(0x87CEEB); dirLight.intensity = 1.0; ambientLight.intensity = 0.5; document.body.style.background = '#87CEEB'; for (let id in localItems) { if (localItems[id].type === 'torch') { localItems[id].torchData.light.intensity = 0; localItems[id].torchData.fire.visible = false; } } } 
        else { scene.background = new THREE.Color(0x05051a); scene.fog.color.setHex(0x05051a); dirLight.intensity = 0.1; ambientLight.intensity = 0.1; document.body.style.background = '#05051a'; for (let id in localItems) { if (localItems[id].type === 'torch') { localItems[id].torchData.light.intensity = 150; localItems[id].torchData.fire.visible = true; } } }
    }
    uiDay.innerText = `Day ${data.gameDay}`; uiClock.innerText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`; uiPeriod.innerText = period;
});

const actionBtn = document.getElementById('action-btn'); const fadeOverlay = document.getElementById('fade-overlay');
let activeBed = null; let activePig = null; let activePickup = null; let isSleeping = false; let previousPlayerPos = new THREE.Vector3(); let previousPlayerRot = new THREE.Euler();
let isRiding = false; let mountedPig = null; let nearWater = false; let activeShop = null;

actionBtn.addEventListener('click', () => {
    if (activeShop && localStats.fish > 0) { socket.emit('sellFish'); return; }
    if (nearWater && !isFishing && !isRiding && !carriedItemId && !isDrowning) { isFishing = true; fishingRod.visible = true; actionBtn.innerHTML = '⏳ Fishing...'; actionBtn.style.pointerEvents = 'none'; setTimeout(() => { isFishing = false; fishingRod.visible = false; actionBtn.style.pointerEvents = 'auto'; if (Math.random() > 0.4) { socket.emit('catchFish'); } }, 3000); return; }
    if (carriedItemId) { let placeDir = new THREE.Vector3(); player.getWorldDirection(placeDir); let targetX = player.position.x + placeDir.x * 2.5; let targetZ = player.position.z + placeDir.z * 2.5; socket.emit('placeItem', { id: carriedItemId, x: targetX, z: targetZ, rotY: player.rotation.y }); carriedItemId = null; actionBtn.style.display = 'none'; return; }
    if (isRiding) { isRiding = false; mountedPig = null; socket.emit('unmountPig'); player.position.x += 1; player.position.y += 0.5; actionBtn.style.display = 'none'; return; }
    if(!isSleeping && activeBed) { isSleeping = true; actionBtn.style.display = 'none'; previousPlayerPos.copy(player.position); previousPlayerRot.copy(player.rotation); player.position.copy(activeBed.sleepPosition); player.rotation.set(-Math.PI / 2, 0, activeBed.sleepRotY); velocityY = 0; fadeOverlay.style.opacity = 1; setTimeout(() => { socket.emit('requestTimeSkip'); setTimeout(() => { fadeOverlay.style.opacity = 0; player.position.copy(previousPlayerPos); player.rotation.copy(previousPlayerRot); isSleeping = false; }, 1500); }, 1500); return; }
    if (activePickup) { socket.emit('pickupItem', activePickup.id); carriedItemId = activePickup.id; actionBtn.style.display = 'none'; return; }
    if(!isSleeping && activePig) { isRiding = true; mountedPig = activePig; socket.emit('ridePig', activePig.id); return; }
});

const soundBtn = document.getElementById('sound-btn'); const mySound = new Audio('hidup-jokowi.mp3'); mySound.volume = 0.5; 
soundBtn.addEventListener('click', () => { mySound.currentTime = 0; mySound.play().catch(e => console.log(e)); });

function animate() {
    requestAnimationFrame(animate);
    updateMinimap();

    if (!isDay) { for(let id in localItems) { if (localItems[id].type === 'torch') localItems[id].torchData.light.intensity = 120 + Math.random() * 50; } }
    if (isFishing) { let shake = Math.sin(Date.now() * 0.01) * 0.05; armR.rotation.x = -1.2 + shake; armL.rotation.x = -1.2 + shake; legL.rotation.x = 0; legR.rotation.x = 0; }
    
    // DETEKSI TENGGELAM
    let distCenter = Math.sqrt(player.position.x * player.position.x + player.position.z * player.position.z); 
    if (distCenter > 148 && !isDrowning && !isSleeping) {
        isDrowning = true;
        fadeOverlay.style.opacity = 1; 
        actionBtn.style.display = 'none';
        
        if (isRiding) { isRiding = false; mountedPig = null; socket.emit('unmountPig'); }
        if (isFishing) { isFishing = false; fishingRod.visible = false; actionBtn.style.pointerEvents = 'auto'; }

        setTimeout(() => {
            player.position.set(0, 5, 5); 
            velocityY = 0;
            isDrowning = false;
            fadeOverlay.style.opacity = 0; 

            // === FIX ZOMBIE POSE (Reset Tangan) ===
            armL.rotation.set(0,0,0);
            armR.rotation.set(0,0,0);

            socket.emit('move', { position: { x: 0, y: 5, z: 5 }, rotation: { y: player.rotation.y } });
        }, 1500);
    }

    const currentSpeed = isRiding ? 0.45 : 0.25;

    for (let id in localItems) { let item = localItems[id]; if (item.carriedBy === socket.id) { item.group.position.set(player.position.x, player.position.y + 2.5, player.position.z); item.group.rotation.set(0, player.rotation.y, 0); item.group.scale.set(0.3, 0.3, 0.3); item.group.visible = true; } else if (item.carriedBy) { if (remotePlayers[item.carriedBy]) { let rp = remotePlayers[item.carriedBy]; item.group.position.set(rp.position.x, rp.position.y + 2.5, rp.position.z); item.group.rotation.set(0, rp.rotation.y, 0); item.group.scale.set(0.3, 0.3, 0.3); item.group.visible = true; } else { item.group.visible = false; } } else { item.group.position.set(item.targetX, 0, item.targetZ); item.group.rotation.set(0, item.targetRotY, 0); item.group.scale.set(1, 1, 1); item.group.visible = true; } }
    for (let id in localPigs) { let npc = localPigs[id]; npc.mesh.position.x = THREE.MathUtils.lerp(npc.mesh.position.x, npc.targetX, 0.2); npc.mesh.position.z = THREE.MathUtils.lerp(npc.mesh.position.z, npc.targetZ, 0.2); let rotDiff = npc.targetRotY - npc.mesh.rotation.y; rotDiff = Math.atan2(Math.sin(rotDiff), Math.cos(rotDiff)); npc.mesh.rotation.y += rotDiff * 0.2; if (npc.state === 'ridden') { if (npc.riddenBy === socket.id) { npc.mesh.position.set(player.position.x, player.position.y - 1.0, player.position.z); npc.mesh.rotation.y = player.rotation.y; npc.moveTime += 0.4; } else if (remotePlayers[npc.riddenBy]) { let otherP = remotePlayers[npc.riddenBy]; npc.mesh.position.set(otherP.position.x, otherP.position.y - 1.0, otherP.position.z); npc.mesh.rotation.y = otherP.rotation.y; npc.moveTime += 0.4; } } else { let npcGroundY = -5; raycaster.set(new THREE.Vector3(npc.mesh.position.x, npc.mesh.position.y + 1, npc.mesh.position.z), new THREE.Vector3(0, -1, 0)); let npcIntersects = raycaster.intersectObjects(solidGrounds, false); if (npcIntersects.length > 0) npcGroundY = npcIntersects[0].point.y; npc.velocityY += gravity; npc.mesh.position.y += npc.velocityY; if (npc.mesh.position.y <= npcGroundY) { npc.mesh.position.y = npcGroundY; npc.velocityY = 0; } if (npc.state === 'walking') npc.moveTime += 0.25; } if (npc.state === 'walking' || npc.state === 'ridden') { npc.legs[0].rotation.x = Math.sin(npc.moveTime) * 0.5; npc.legs[3].rotation.x = Math.sin(npc.moveTime) * 0.5; npc.legs[1].rotation.x = -Math.sin(npc.moveTime) * 0.5; npc.legs[2].rotation.x = -Math.sin(npc.moveTime) * 0.5; } else { npc.legs.forEach(leg => leg.rotation.x = THREE.MathUtils.lerp(leg.rotation.x, 0, 0.1)); } }

    let isInsideHouse = false; for (let house of interactiveHouses) { if (house.box.containsPoint(player.position)) { house.roof.visible = false; isInsideHouse = true; } else { house.roof.visible = true; } }
    if (isInsideHouse) controls.maxDistance = 5; else controls.maxDistance = 20;

    let distLake = Math.sqrt((player.position.x - 35)**2 + (player.position.z - 15)**2);
    nearWater = (distCenter > 135 && distCenter < 160) || (distLake < 18); activeShop = null;
    for (let s of shops) { if (player.position.distanceTo(s.position) < 4.0) { activeShop = s; break; } }

    if (!isSleeping && !isFishing && !isDrowning) {
        activeBed = null; activePig = null; activePickup = null;
        if (carriedItemId) { actionBtn.style.display = 'block'; actionBtn.innerHTML = `👇 Place ${localItems[carriedItemId].type.toUpperCase()}`; } 
        else if (isRiding) { actionBtn.style.display = 'block'; actionBtn.innerHTML = '🚶 Dismount'; } 
        else {
            for (let bed of beds) { if (bed.triggerBox.containsPoint(player.position)) { activeBed = bed; break; } }
            if (!activeBed) { let minDist = 3.0; for (let id in localItems) { if (localItems[id].carriedBy) continue; let dist = player.position.distanceTo(localItems[id].group.position); if (dist < minDist) { minDist = dist; activePickup = localItems[id]; } } }
            if (!activeBed && !activePickup) { for (let id in localPigs) { if ((localPigs[id].state === 'idle' || localPigs[id].state === 'walking') && player.position.distanceTo(localPigs[id].mesh.position) < 3.0) { activePig = localPigs[id]; break; } } }
            if (activeShop && localStats.fish > 0) { actionBtn.style.display = 'block'; actionBtn.innerHTML = '⚖️ Sell Fish'; }
            else if (nearWater) { actionBtn.style.display = 'block'; actionBtn.innerHTML = '🎣 Fish'; }
            else if (activeBed) { actionBtn.style.display = 'block'; actionBtn.innerHTML = '💤 Sleep'; } 
            else if (activePickup) { actionBtn.style.display = 'block'; actionBtn.innerHTML = `🖐️ Pick Up ${activePickup.type}`; }
            else if (activePig) { actionBtn.style.display = 'block'; actionBtn.innerHTML = '🐎 Ride'; } 
            else { actionBtn.style.display = 'none'; }
        }
    }

    if (isDrowning) {
        player.position.y -= 0.05; 
        moveTime += 0.5;
        armL.rotation.x = Math.sin(moveTime) * 2; armR.rotation.x = -Math.sin(moveTime) * 2;
        armL.rotation.z = 1.0; armR.rotation.z = -1.0; 
    }

    if (!isSleeping && !isDrowning) {
        let currentGroundY = -5; raycaster.set(new THREE.Vector3(player.position.x, player.position.y + 1, player.position.z), new THREE.Vector3(0, -1, 0)); let intersects = raycaster.intersectObjects(solidGrounds, false); if (intersects.length > 0) currentGroundY = intersects[0].point.y;
        let targetY = isRiding ? currentGroundY + 1.0 : currentGroundY; velocityY += gravity; player.position.y += velocityY; if (player.position.y <= targetY) { player.position.y = targetY; velocityY = 0; isJumping = false; } if (keys[' '] && !isJumping && !isFishing) { velocityY = 0.35; isJumping = true; }
        const camForward = new THREE.Vector3(); camera.getWorldDirection(camForward); camForward.y = 0; camForward.normalize(); const camRight = new THREE.Vector3(-camForward.z, 0, camForward.x); 
        let inputY = (keys.w ? 1 : 0) - (keys.s ? 1 : 0); let inputX = (keys.d ? 1 : 0) - (keys.a ? 1 : 0); if (isJoyActive) { inputY += joyY; inputX += joyX; }
        const moveDir = new THREE.Vector3(); if (!isFishing) { if (inputY !== 0) moveDir.addScaledVector(camForward, inputY); if (inputX !== 0) moveDir.addScaledVector(camRight, inputX); if (moveDir.lengthSq() > 1) moveDir.normalize(); }
        
        if (moveDir.lengthSq() > 0) {
            const nextPos = player.position.clone().addScaledVector(moveDir, currentSpeed); let isColliding = false; playerBox.min.set(nextPos.x - 0.25, player.position.y, nextPos.z - 0.25); playerBox.max.set(nextPos.x + 0.25, player.position.y + 1.5, nextPos.z + 0.25);
            for (let box of wallObjects) { if (playerBox.intersectsBox(box)) { isColliding = true; break; } }
            if (!isColliding) { for (let id in localItems) { if (localItems[id].carriedBy) continue; let itemBox = new THREE.Box3().setFromObject(localItems[id].group); itemBox.expandByScalar(-0.2); if (playerBox.intersectsBox(itemBox)) { isColliding = true; break; } } }
            if (!isColliding) { for (let id in localPigs) { if (localPigs[id] === mountedPig) continue; let npcBox = new THREE.Box3().setFromObject(localPigs[id].mesh); npcBox.expandByScalar(-0.1); if (playerBox.intersectsBox(npcBox)) { isColliding = true; break; } } }
            if (!isColliding) { player.position.x = nextPos.x; player.position.z = nextPos.z; } player.rotation.x = 0; player.lookAt(player.position.clone().add(moveDir));
            
            if (isRiding) { 
                armL.rotation.x = 0.4; armR.rotation.x = 0.4; legL.rotation.x = -0.4; legR.rotation.x = -0.4; legL.rotation.z = -0.2; legR.rotation.z = 0.2; 
            } else { 
                moveTime += (0.25 * (isJoyActive ? Math.max(Math.abs(joyX), Math.abs(joyY)) : 1)); 
                armL.rotation.x = Math.sin(moveTime) * 0.8; armR.rotation.x = -Math.sin(moveTime) * 0.8; 
                // === FIX ZOMBIE POSE (Reset Tangan saat jalan) ===
                armL.rotation.z = 0; armR.rotation.z = 0; 

                legL.rotation.x = -Math.sin(moveTime) * 0.8; legR.rotation.x = Math.sin(moveTime) * 0.8; legL.rotation.z = 0; legR.rotation.z = 0; 
            }
        } else if (!isFishing) {
            player.rotation.x = 0; 
            if (isRiding) { 
                armL.rotation.x = 0.4; armR.rotation.x = 0.4; legL.rotation.x = -0.4; legR.rotation.x = -0.4; 
            } else { 
                armL.rotation.x = THREE.MathUtils.lerp(armL.rotation.x, 0, 0.1); armR.rotation.x = THREE.MathUtils.lerp(armR.rotation.x, 0, 0.1); 
                // === FIX ZOMBIE POSE (Reset Tangan saat diam) ===
                armL.rotation.z = THREE.MathUtils.lerp(armL.rotation.z, 0, 0.1); armR.rotation.z = THREE.MathUtils.lerp(armR.rotation.z, 0, 0.1); 

                legL.rotation.x = THREE.MathUtils.lerp(legL.rotation.x, 0, 0.1); legR.rotation.x = THREE.MathUtils.lerp(legR.rotation.x, 0, 0.1); legL.rotation.z = 0; legR.rotation.z = 0; 
            }
        }
    } 

    for (let id in remotePlayers) { const p = remotePlayers[id]; const anim = p.userData; const isMoving = p.position.distanceTo(anim.lastPos) > 0.01; if (isMoving) { anim.moveTime += 0.2; const mt = anim.moveTime; anim.armL.rotation.x = Math.sin(mt) * 0.8; anim.armR.rotation.x = -Math.sin(mt) * 0.8; anim.legL.rotation.x = -Math.sin(mt) * 0.8; anim.legR.rotation.x = Math.sin(mt) * 0.8; } else { anim.armL.rotation.x = THREE.MathUtils.lerp(anim.armL.rotation.x, 0, 0.1); anim.armR.rotation.x = THREE.MathUtils.lerp(anim.armR.rotation.x, 0, 0.1); anim.legL.rotation.x = THREE.MathUtils.lerp(anim.legL.rotation.x, 0, 0.1); anim.legR.rotation.x = THREE.MathUtils.lerp(anim.legR.rotation.x, 0, 0.1); } anim.lastPos.copy(p.position); }
    controls.target.set(player.position.x, player.position.y + 1.5, player.position.z); controls.update(); renderer.render(scene, camera);
}
animate();
window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });