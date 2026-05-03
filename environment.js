// environment.js
import * as THREE from 'three';

export const solidGrounds = []; export const wallObjects = [];  
export const interactiveHouses = []; export const beds = []; export const shops = [];
export const torchLights = [];

function addWall(mesh) { mesh.updateMatrixWorld(true); wallObjects.push(new THREE.Box3().setFromObject(mesh)); }

export function createWorld(scene) {
    const ocean = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshStandardMaterial({ color: 0x006994, transparent: true, opacity: 0.8 }));
    ocean.rotation.x = -Math.PI / 2; ocean.position.y = -2; scene.add(ocean); solidGrounds.push(ocean);
    const island = new THREE.Mesh(new THREE.CylinderGeometry(150, 160, 4, 64), new THREE.MeshStandardMaterial({ color: 0x4B8B3B }));
    island.position.y = -2; island.receiveShadow = true; scene.add(island); solidGrounds.push(island);

    createHollowHouse(scene, -25, -15, Math.PI / 4); createHollowHouse(scene, -15, -25, -Math.PI / 6); 
    
    // Tenda sudah dihapus dari sini!
    
    // Danau tetap dipertahankan
    createLake(scene, 35, 10, 15); 
    
    createMountain(scene, 0, -80); createMountain(scene, 80, -40); 
    createHill(scene, 15, -45, 1.5); createHill(scene, -30, 20, 2);

    // BANGUN TOKO IKAN
    createShop(scene, 20, 25, -Math.PI / 4);
}

// === FUNGSI TOKO IKAN ===
function createShop(scene, x, z, rotY = 0) {
    const group = new THREE.Group();
    const table = new THREE.Mesh(new THREE.BoxGeometry(4, 1.2, 2), new THREE.MeshStandardMaterial({color: 0x8b4513}));
    table.position.y = 0.6; table.castShadow = true; group.add(table);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(5, 0.2, 3), new THREE.MeshStandardMaterial({color: 0x1e90ff}));
    roof.position.set(0, 3.5, 0); roof.rotation.x = -Math.PI/16; roof.castShadow = true; group.add(roof);
    const poleMat = new THREE.MeshStandardMaterial({color: 0x5c4033});
    const pole1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.5), poleMat); pole1.position.set(-2, 1.75, -1); pole1.castShadow = true; group.add(pole1);
    const pole2 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.5), poleMat); pole2.position.set(2, 1.75, -1); pole2.castShadow = true; group.add(pole2);
    
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 128; const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1e90ff'; ctx.lineWidth = 15; ctx.strokeRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1e90ff'; ctx.font = '900 60px Arial'; ctx.textAlign = 'center'; ctx.fillText('🐟 FISH SHOP 💰', canvas.width/2, 85);
    const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace;
    const signMat = new THREE.MeshStandardMaterial({color:0xffffff}); const signTexMat = new THREE.MeshStandardMaterial({map:tex});
    const sign = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1, 0.1), [signMat, signMat, signMat, signMat, signTexMat, signMat]);
    sign.position.set(0, 3.5, 1.55); group.add(sign);

    const light = new THREE.PointLight(0xffffff, 1.5, 15); light.position.set(0, 2.5, 0); group.add(light);

    group.position.set(x, 0, z); group.rotation.y = rotY; scene.add(group);
    shops.push({ position: new THREE.Vector3(x, 0, z) });
    table.updateMatrixWorld(true); addWall(table); 
}

// === FACTORY OBJEK DINAMIS ===
export function createPigMesh() {
    const pig = new THREE.Group(); const mat = new THREE.MeshStandardMaterial({ color: 0xFFB6C1 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 1.2), mat); body.position.y = 0.6; body.castShadow = true; const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), mat); head.position.set(0, 1, 0.6); head.castShadow = true; pig.add(body, head); 
    function createLeg(lx, lz) { const legGroup = new THREE.Group(); const leg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.2), mat); leg.position.y = -0.2; leg.castShadow = true; legGroup.add(leg); legGroup.position.set(lx, 0.4, lz); return legGroup; }
    const legFL = createLeg(0.25, 0.4); const legFR = createLeg(-0.25, 0.4); const legBL = createLeg(0.25, -0.4); const legBR = createLeg(-0.25, -0.4); pig.add(legFL, legFR, legBL, legBR);
    return { mesh: pig, legs: [legFL, legFR, legBL, legBR] };
}

export function createTreeMesh() {
    const group = new THREE.Group(); const trunk = new THREE.Mesh(new THREE.BoxGeometry(1, 3, 1), new THREE.MeshStandardMaterial({ color: 0x8B4513 })); trunk.position.y = 1.5; trunk.castShadow = true; group.add(trunk); const leaves = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), new THREE.MeshStandardMaterial({ color: 0x228B22 })); leaves.position.y = 4; leaves.castShadow = true; group.add(leaves);
    return group;
}

export function createTorchMesh() {
    const group = new THREE.Group(); const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2, 8), new THREE.MeshStandardMaterial({ color: 0x5c4033 })); pole.position.y = 1; pole.castShadow = true; group.add(pole); const fire = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 8), new THREE.MeshBasicMaterial({ color: 0xff8c00 })); fire.position.y = 2.2; fire.visible = false; group.add(fire); const light = new THREE.PointLight(0xffaa00, 0, 15); light.position.y = 2.5; group.add(light);
    return { mesh: group, light: light, fire: fire };
}

export function createMadingMesh(title, lines) {
    const group = new THREE.Group(); const poleMat = new THREE.MeshStandardMaterial({ color: 0x3d2314 }); const poleL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4, 0.4), poleMat); poleL.position.set(-2.2, 2, 0); poleL.castShadow = true; const poleR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4, 0.4), poleMat); poleR.position.set(2.2, 2, 0); poleR.castShadow = true; group.add(poleL, poleR); const roof = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.3, 1.2), new THREE.MeshStandardMaterial({ color: 0x2b170b })); roof.position.set(0, 4.1, 0.1); roof.rotation.x = Math.PI / 16; roof.castShadow = true; group.add(roof); group.add(new THREE.PointLight(0xffddaa, 1.5, 15).position.set(0, 3.5, 2));
    const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 512; const ctx = canvas.getContext('2d'); const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height); gradient.addColorStop(0, '#ffffff'); gradient.addColorStop(1, '#fef3c7'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.strokeStyle = '#b45309'; ctx.lineWidth = 15; ctx.strokeRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#dc2626'; [[35,35], [989,35], [35,477], [989,477]].forEach(pos => { ctx.beginPath(); ctx.arc(pos[0], pos[1], 10, 0, Math.PI * 2); ctx.fill(); }); ctx.fillStyle = '#991b1b'; ctx.font = '900 55px "Segoe UI", Arial, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(title, canvas.width / 2, 85); ctx.beginPath(); ctx.moveTo(250, 110); ctx.lineTo(774, 110); ctx.lineWidth = 4; ctx.strokeStyle = '#d97706'; ctx.stroke(); ctx.fillStyle = '#1e293b'; ctx.font = 'bold 34px "Segoe UI", Arial, sans-serif'; ctx.textAlign = 'left'; let startY = 180; lines.forEach(l => { ctx.fillText(l, 80, startY); startY += 60; });
    const texture = new THREE.CanvasTexture(canvas); texture.needsUpdate = true; texture.colorSpace = THREE.SRGBColorSpace; const board = new THREE.Mesh(new THREE.BoxGeometry(4.4, 2.4, 0.1), [new THREE.MeshStandardMaterial({color:0xdeb887}), new THREE.MeshStandardMaterial({color:0xdeb887}), new THREE.MeshStandardMaterial({color:0xdeb887}), new THREE.MeshStandardMaterial({color:0xdeb887}), new THREE.MeshStandardMaterial({ map: texture }), new THREE.MeshStandardMaterial({color:0xdeb887})]); board.position.set(0, 2.2, 0.15); board.castShadow = true; group.add(board); 
    return group;
}

// === FUNGSI STATIS LAINNYA ===
function createHollowHouse(scene, x, z, rotY = 0) { const group = new THREE.Group(); const wallMat = new THREE.MeshStandardMaterial({ color: 0xfff8dc }); const width = 8, depth = 8, height = 4, thickness = 0.5; const floor = new THREE.Mesh(new THREE.BoxGeometry(width, 0.2, depth), new THREE.MeshStandardMaterial({ color: 0x654321 })); floor.position.set(0, 0.1, 0); floor.receiveShadow = true; group.add(floor); const wallL = new THREE.Mesh(new THREE.BoxGeometry(thickness, height, depth), wallMat); wallL.position.set(-width/2 + thickness/2, height/2, 0); const wallR = new THREE.Mesh(new THREE.BoxGeometry(thickness, height, depth), wallMat); wallR.position.set(width/2 - thickness/2, height/2, 0); const wallB = new THREE.Mesh(new THREE.BoxGeometry(width, height, thickness), wallMat); wallB.position.set(0, height/2, -depth/2 + thickness/2); const wallFL = new THREE.Mesh(new THREE.BoxGeometry((width - 2.5)/2, height, thickness), wallMat); wallFL.position.set(-2.625, height/2, depth/2 - thickness/2); const wallFR = new THREE.Mesh(new THREE.BoxGeometry((width - 2.5)/2, height, thickness), wallMat); wallFR.position.set(2.625, height/2, depth/2 - thickness/2); const wallFTop = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1, thickness), wallMat); wallFTop.position.set(0, 3.5, depth/2 - thickness/2); const walls = [wallL, wallR, wallB, wallFL, wallFR, wallFTop]; walls.forEach(w => { w.castShadow = true; w.receiveShadow = true; group.add(w); }); const roof = new THREE.Mesh(new THREE.ConeGeometry(7, 3, 4), new THREE.MeshStandardMaterial({ color: 0x8b0000 })); roof.position.set(0, height + 1.5, 0); roof.rotation.y = Math.PI / 4; roof.castShadow = true; group.add(roof); const bedMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a }); const bed = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.6, 4), bedMat); bed.position.set(-2, 0.4, -1.5); bed.castShadow = true; group.add(bed); const pillow = new THREE.Mesh(new THREE.BoxGeometry(2, 0.2, 1), new THREE.MeshStandardMaterial({ color: 0xffffff })); pillow.position.set(-2, 0.8, -2.8); group.add(pillow); const table = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 2), new THREE.MeshStandardMaterial({ color: 0x5c4033 })); table.position.set(2, 0.6, -2); table.castShadow = true; group.add(table); const indoorLight = new THREE.PointLight(0xffaa55, 1, 15); indoorLight.position.set(0, 3, 0); group.add(indoorLight); group.position.set(x, 0, z); group.rotation.y = rotY; scene.add(group); group.updateMatrixWorld(true); walls.forEach(w => addWall(w)); addWall(bed); addWall(table); solidGrounds.push(floor); const triggerBox = new THREE.Box3().setFromObject(floor); triggerBox.max.y += 5; interactiveHouses.push({ box: triggerBox, roof: roof }); bed.updateMatrixWorld(true); const bedTrigger = new THREE.Box3().setFromObject(bed); bedTrigger.expandByScalar(1.5); const bedCenter = new THREE.Vector3(); bed.getWorldPosition(bedCenter); bedCenter.y += 0.8; beds.push({ triggerBox: bedTrigger, sleepPosition: bedCenter, sleepRotY: rotY + Math.PI/2 }); }
function createHill(scene, x, z, scale) { const hill = new THREE.Mesh(new THREE.SphereGeometry(10, 16, 16), new THREE.MeshStandardMaterial({ color: 0x55aa55 })); hill.position.set(x, 0, z); hill.scale.set(scale, scale * 0.4, scale); hill.receiveShadow = true; scene.add(hill); solidGrounds.push(hill); }
function createMountain(scene, x, z) { const mtn = new THREE.Mesh(new THREE.ConeGeometry(40, 50, 8), new THREE.MeshStandardMaterial({ color: 0x696969 })); mtn.position.set(x, 25, z); mtn.castShadow = true; mtn.receiveShadow = true; scene.add(mtn); solidGrounds.push(mtn); }
function createLake(scene, x, z, radius) { 
    const water = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.5, 32), new THREE.MeshStandardMaterial({ color: 0x1E90FF, transparent: true, opacity: 0.8 })); 
    water.position.set(x, 0.1, z); scene.add(water); solidGrounds.push(water); 
    const sand = new THREE.Mesh(new THREE.TorusGeometry(radius + 1, 1, 8, 32), new THREE.MeshStandardMaterial({ color: 0xEEDC82 })); 
    sand.position.set(x, 0.15, z); sand.rotation.x = Math.PI / 2; scene.add(sand); solidGrounds.push(sand); 
}