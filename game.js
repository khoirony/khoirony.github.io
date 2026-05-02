// game.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Import dari file modular kita
import { createWorld, solidGrounds, wallObjects, interactiveHouses, npcs, beds } from './environment.js';
import { initNetworking, remotePlayers } from './networking.js';

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

// ==========================================
// 2. BANGUN DUNIA
// ==========================================
createWorld(scene);

// ==========================================
// 3. KARAKTER PEMAIN LOKAL
// ==========================================
const player = new THREE.Group(); scene.add(player); 
player.position.set(0, 5, 5);
player.rotation.order = 'YXZ'; 
player.userData = {}; 

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

// ==========================================
// 4. KONTROL & INPUT
// ==========================================
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.maxPolarAngle = Math.PI / 2.1; controls.minDistance = 2; controls.maxDistance = 20;

let velocityY = 0; const gravity = -0.02; let isJumping = false;
let moveTime = 0; const playerBox = new THREE.Box3();
const raycaster = new THREE.Raycaster(); 

const keys = { w: false, a: false, s: false, d: false, ' ': false };
const chatInput = document.getElementById('chat-input');
window.addEventListener('keydown', (e) => { 
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
// 5. INISIALISASI NETWORKING
// ==========================================
initNetworking(scene, player);

// ==========================================
// 6. SISTEM WAKTU & AKSI
// ==========================================
let gameTime = 8 * 60; let gameDay = 1; let isDay = true; let timeSpeed = 1; 
const uiDay = document.getElementById('hud-day'); const uiClock = document.getElementById('hud-clock'); const uiPeriod = document.getElementById('hud-period');

function updateGameTime() {
    gameTime += timeSpeed;
    if (gameTime >= 24 * 60) { gameTime = 0; gameDay++; }
    const h = Math.floor(gameTime / 60); const m = Math.floor(gameTime % 60);
    let period = 'Malam'; let newIsDay = false;

    if (h >= 6 && h < 10) { period = 'Pagi'; newIsDay = true; }
    else if (h >= 10 && h < 15) { period = 'Siang'; newIsDay = true; }
    else if (h >= 15 && h < 18) { period = 'Sore'; newIsDay = true; }
    else { period = 'Malam'; newIsDay = false; }

    if (newIsDay !== isDay && scene) {
        isDay = newIsDay;
        if(isDay) {
            scene.background = new THREE.Color(0x87CEEB); scene.fog.color.setHex(0x87CEEB);
            dirLight.intensity = 1.0; ambientLight.intensity = 0.5; document.body.style.background = '#87CEEB';
        } else {
            scene.background = new THREE.Color(0x05051a); scene.fog.color.setHex(0x05051a);
            dirLight.intensity = 0.1; ambientLight.intensity = 0.1; document.body.style.background = '#05051a';
        }
    }

    uiDay.innerText = `Hari ke-${gameDay}`;
    uiClock.innerText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    uiPeriod.innerText = period;
}
setInterval(updateGameTime, 1000);

const actionBtn = document.getElementById('action-btn');
const fadeOverlay = document.getElementById('fade-overlay');
let activeBed = null; let activePig = null;
let isSleeping = false; let previousPlayerPos = new THREE.Vector3(); let previousPlayerRot = new THREE.Euler();
let isRiding = false; let mountedPig = null;

actionBtn.addEventListener('click', () => {
    if (isRiding) {
        isRiding = false; mountedPig.state = 'idle'; mountedPig = null;
        player.position.x += 1; player.position.y += 0.5; actionBtn.style.display = 'none'; return;
    }
    if(!isSleeping && activeBed) {
        isSleeping = true; actionBtn.style.display = 'none';
        previousPlayerPos.copy(player.position); previousPlayerRot.copy(player.rotation);
        player.position.copy(activeBed.sleepPosition); player.rotation.set(-Math.PI / 2, 0, activeBed.sleepRotY); velocityY = 0;
        fadeOverlay.style.opacity = 1;
        setTimeout(() => {
            if (isDay) { gameTime = 18 * 60; isDay = false; } else { gameTime = 6 * 60; gameDay++; isDay = true; }
            setTimeout(() => { fadeOverlay.style.opacity = 0; player.position.copy(previousPlayerPos); player.rotation.copy(previousPlayerRot); isSleeping = false; }, 1500);
        }, 1500);
        return;
    }
    if(!isSleeping && activePig) { isRiding = true; mountedPig = activePig; mountedPig.state = 'ridden'; return; }
});

// ==========================================
// 7. GAME LOOP UTAMA
// ==========================================
function animate() {
    requestAnimationFrame(animate);
    const currentSpeed = isRiding ? 0.45 : 0.25;

    // NPC Babi Logic
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

        npc.velocityY += gravity; npc.mesh.position.y += npc.velocityY;
        if (npc.mesh.position.y <= npcGroundY) { npc.mesh.position.y = npcGroundY; npc.velocityY = 0; }

        if (npc.state === 'walking') {
            let diff = npc.direction - npc.mesh.rotation.y; diff = Math.atan2(Math.sin(diff), Math.cos(diff));
            npc.mesh.rotation.y += diff * 0.05; npc.mesh.translateZ(npc.speed);
            npc.moveTime += 0.25;
            npc.legs[0].rotation.x = Math.sin(npc.moveTime) * 0.5; npc.legs[3].rotation.x = Math.sin(npc.moveTime) * 0.5; 
            npc.legs[1].rotation.x = -Math.sin(npc.moveTime) * 0.5; npc.legs[2].rotation.x = -Math.sin(npc.moveTime) * 0.5; 
        } else {
            npc.legs.forEach(leg => leg.rotation.x = THREE.MathUtils.lerp(leg.rotation.x, 0, 0.1));
        }
    });

    // Cek Masuk Rumah
    let isInsideHouse = false;
    for (let house of interactiveHouses) {
        if (house.box.containsPoint(player.position)) { house.roof.visible = false; isInsideHouse = true; } 
        else { house.roof.visible = true; }
    }
    if (isInsideHouse) controls.maxDistance = 5; else controls.maxDistance = 20;

    // Logika Pemain & Aksi
    if (!isSleeping) {
        activeBed = null; activePig = null;
        if (isRiding) {
            actionBtn.style.display = 'block'; actionBtn.innerHTML = '🚶 Turun';
        } else {
            for (let bed of beds) { if (bed.triggerBox.containsPoint(player.position)) { activeBed = bed; break; } }
            if (!activeBed) { for (let npc of npcs) { if (player.position.distanceTo(npc.mesh.position) < 3.0) { activePig = npc; break; } } }
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
        velocityY += gravity; player.position.y += velocityY;
        if (player.position.y <= targetY) { player.position.y = targetY; velocityY = 0; isJumping = false; }
        if (keys[' '] && !isJumping) { velocityY = 0.35; isJumping = true; }

        const camForward = new THREE.Vector3(); camera.getWorldDirection(camForward); camForward.y = 0; camForward.normalize();
        const camRight = new THREE.Vector3(-camForward.z, 0, camForward.x); 

        let inputY = (keys.w ? 1 : 0) - (keys.s ? 1 : 0); let inputX = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
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
            
            for (let box of wallObjects) { if (playerBox.intersectsBox(box)) { isColliding = true; break; } }
            if (!isColliding) {
                for (let npc of npcs) {
                    if (npc === mountedPig) continue;
                    let npcBox = new THREE.Box3().setFromObject(npc.mesh); npcBox.expandByScalar(-0.1); 
                    if (playerBox.intersectsBox(npcBox)) { isColliding = true; break; }
                }
            }
            if (!isColliding) { player.position.x = nextPos.x; player.position.z = nextPos.z; }
            player.rotation.x = 0; player.lookAt(player.position.clone().add(moveDir));
            
            if (isRiding) {
                armL.rotation.x = 0.4; armR.rotation.x = 0.4; legL.rotation.x = -0.4; legR.rotation.x = -0.4; legL.rotation.z = -0.2; legR.rotation.z = 0.2;
                mountedPig.moveTime += 0.4; 
                mountedPig.legs[0].rotation.x = Math.sin(mountedPig.moveTime) * 0.8; mountedPig.legs[3].rotation.x = Math.sin(mountedPig.moveTime) * 0.8; 
                mountedPig.legs[1].rotation.x = -Math.sin(mountedPig.moveTime) * 0.8; mountedPig.legs[2].rotation.x = -Math.sin(mountedPig.moveTime) * 0.8; 
            } else {
                moveTime += (0.25 * (isJoyActive ? Math.max(Math.abs(joyX), Math.abs(joyY)) : 1)); 
                armL.rotation.x = Math.sin(moveTime) * 0.8; armR.rotation.x = -Math.sin(moveTime) * 0.8;
                legL.rotation.x = -Math.sin(moveTime) * 0.8; legR.rotation.x = Math.sin(moveTime) * 0.8;
                legL.rotation.z = 0; legR.rotation.z = 0;
            }
        } else {
            player.rotation.x = 0;
            if (isRiding) {
                armL.rotation.x = 0.4; armR.rotation.x = 0.4; legL.rotation.x = -0.4; legR.rotation.x = -0.4;
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

    // Animasi Player Remote (Orang Lain)
    for (let id in remotePlayers) {
        const p = remotePlayers[id]; const anim = p.userData;
        const isMoving = p.position.distanceTo(anim.lastPos) > 0.01; 
        if (isMoving) {
            anim.moveTime += 0.2; const mt = anim.moveTime;
            anim.armL.rotation.x = Math.sin(mt) * 0.8; anim.armR.rotation.x = -Math.sin(mt) * 0.8;
            anim.legL.rotation.x = -Math.sin(mt) * 0.8; anim.legR.rotation.x = Math.sin(mt) * 0.8;
        } else {
            anim.armL.rotation.x = THREE.MathUtils.lerp(anim.armL.rotation.x, 0, 0.1); anim.armR.rotation.x = THREE.MathUtils.lerp(anim.armR.rotation.x, 0, 0.1);
            anim.legL.rotation.x = THREE.MathUtils.lerp(anim.legL.rotation.x, 0, 0.1); anim.legR.rotation.x = THREE.MathUtils.lerp(anim.legR.rotation.x, 0, 0.1);
        }
        anim.lastPos.copy(p.position);
    }

    controls.target.set(player.position.x, player.position.y + 1.5, player.position.z);
    controls.update(); renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});