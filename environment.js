import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

export const solidGrounds = []; 
export const wallObjects = [];  
export const interactiveHouses = []; 
export const beds = []; 
export const shops = [];
export const torchLights = [];

function addWall(mesh) { 
    mesh.updateMatrixWorld(true); 
    wallObjects.push(new THREE.Box3().setFromObject(mesh)); 
}

const pigBodyGeo = new THREE.BoxGeometry(0.8, 0.8, 1.2); 
const pigHeadGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6); 
const pigLegGeo = new THREE.BoxGeometry(0.2, 0.4, 0.2); 
const pigMat = new THREE.MeshStandardMaterial({ color: 0xFFB6C1 });

const treeTrunkGeo = new THREE.BoxGeometry(1, 3, 1); 
const treeWoodMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); 
const treeLeavesGeo = new THREE.BoxGeometry(3, 3, 3); 
const treeLeafMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });

const torchPoleGeo = new THREE.CylinderGeometry(0.1, 0.1, 2, 8); 
const torchPoleMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 }); 
const torchFireGeo = new THREE.ConeGeometry(0.25, 0.6, 8); 
const torchFireMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });

const luxuryWoodMat = new THREE.MeshStandardMaterial({ color: 0x2c1a0a, roughness: 0.3, metalness: 0.2 }); 
const goldMat = new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.2, metalness: 0.8 }); 

export function createBrunoStylePortfolio(scene) {
    const fontLoader = new FontLoader();
    
    fontLoader.load('https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json', function (font) {
        const textGeo = new TextGeometry('KHOIRONY ARIEF', {
            font: font, size: 3, height: 0.6, 
            curveSegments: 12, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3
        });
        textGeo.computeBoundingBox();
        const xOffset = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);
        
        const textMat = new THREE.MeshStandardMaterial({ color: 0xffffff }); 
        const textMesh = new THREE.Mesh(textGeo, textMat);
        textMesh.position.set(xOffset, 0.5, -20); 
        textMesh.castShadow = true; textMesh.receiveShadow = true;
        scene.add(textMesh);
        addWall(textMesh);

        const subGeo = new TextGeometry('SOFTWARE ENGINEER', { font: font, size: 1.2, height: 0.3 });
        subGeo.computeBoundingBox();
        const subOffset = -0.5 * (subGeo.boundingBox.max.x - subGeo.boundingBox.min.x);
        
        const subMat = new THREE.MeshStandardMaterial({ color: 0xffd700 }); 
        const subMesh = new THREE.Mesh(subGeo, subMat);
        subMesh.position.set(subOffset, 0.2, -15);
        subMesh.castShadow = true;
        scene.add(subMesh);
        addWall(subMesh);
    });

    const createPedestal = (x, z, colorHex, labelText, geometryShape) => {
        const group = new THREE.Group();

        const base = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 2), new THREE.MeshStandardMaterial({ color: 0xffffff }));
        base.position.y = 0.5; base.castShadow = true; base.receiveShadow = true;
        group.add(base);

        const iconMat = new THREE.MeshStandardMaterial({ color: colorHex, flatShading: true });
        const icon = new THREE.Mesh(geometryShape, iconMat);
        icon.position.y = 2.0; icon.castShadow = true;
        group.add(icon);

        const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '900 60px "Segoe UI", Arial, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(labelText, 256, 80);
        
        const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace;
        const labelPlane = new THREE.Mesh(new THREE.PlaneGeometry(4, 1), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
        labelPlane.rotation.x = -Math.PI / 2;
        labelPlane.position.set(0, 0.05, 2.5);
        group.add(labelPlane);

        group.position.set(x, 0, z);
        scene.add(group);
        addWall(base); 
    };

    createPedestal(-15, -5, 0xff2d20, "LARAVEL", new THREE.OctahedronGeometry(0.8));
    createPedestal(-5, -5, 0x38bdf8, "TAILWIND", new THREE.TorusGeometry(0.5, 0.2, 8, 16));
    createPedestal(5, -5, 0xfbbf24, "ALPINE JS", new THREE.TetrahedronGeometry(0.8));
    createPedestal(15, -5, 0xfb7185, "LIVEWIRE", new THREE.IcosahedronGeometry(0.8));
}

// =======================================================================
// PERBAIKAN TATA LETAK BANGUNAN (Lingkungan disebar agar luas)
// =======================================================================
export function createWorld(scene) {
    const ocean = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshStandardMaterial({ color: 0x006994, transparent: true, opacity: 0.8 }));
    ocean.rotation.x = -Math.PI / 2; ocean.position.y = -2; scene.add(ocean); 

    const island = new THREE.Mesh(new THREE.CylinderGeometry(150, 160, 4, 64), new THREE.MeshStandardMaterial({ color: 0x4B8B3B }));
    island.position.y = -2; island.receiveShadow = true; scene.add(island); 
    solidGrounds.push(island);

    // Panggil Area Bruno Simon di (0,0)
    createBrunoStylePortfolio(scene);

    // MADING DUPLIKAT DI SINI SUDAH DIHAPUS. Semua mading dikontrol server.js.

    // Desa ditarik jauh ke depan kiri (Barat Laut)
    createHollowHouse(scene, -40, 40, Math.PI / 4); 
    createTent(scene, -55, 20, Math.PI / 6); 
    
    // Danau ditarik jauh ke depan kanan (Timur Laut)
    createLake(scene, 40, 35, 15); 
    createShop(scene, 25, 50, -Math.PI / 4);
    createTent(scene, 55, 20, -Math.PI/6);
    
    // Bukit diletakkan di sayap kiri dan kanan agak ke belakang
    createHill(scene, -50, -30, 2); 
    createHill(scene, 50, -40, 1.5); 
    
    // Gunung sebagai background ditarik jauh ke belakang ujung pulau
    createMountain(scene, 0, -90); 
    createMountain(scene, 80, -60); 
}

export function createTreeMesh() {
    const group = new THREE.Group(); 
    const trunk = new THREE.Mesh(treeTrunkGeo, treeWoodMat); trunk.position.y = 1.5; trunk.castShadow = true; group.add(trunk); 
    const leaves = new THREE.Mesh(treeLeavesGeo, treeLeafMat); leaves.position.y = 4; leaves.castShadow = true; group.add(leaves);
    return group;
}

export function createPigMesh() {
    const pig = new THREE.Group(); 
    const body = new THREE.Mesh(pigBodyGeo, pigMat); body.position.y = 0.6; body.castShadow = true; 
    const head = new THREE.Mesh(pigHeadGeo, pigMat); head.position.set(0, 1, 0.6); head.castShadow = true; pig.add(body, head); 
    function createLeg(lx, lz) { const legGroup = new THREE.Group(); const leg = new THREE.Mesh(pigLegGeo, pigMat); leg.position.y = -0.2; leg.castShadow = true; legGroup.add(leg); legGroup.position.set(lx, 0.4, lz); return legGroup; }
    const legFL = createLeg(0.25, 0.4); const legFR = createLeg(-0.25, 0.4); const legBL = createLeg(0.25, -0.4); const legBR = createLeg(-0.25, -0.4); pig.add(legFL, legFR, legBL, legBR);
    return { mesh: pig, legs: [legFL, legFR, legBL, legBR] };
}

export function createTorchMesh() {
    const group = new THREE.Group(); 
    const pole = new THREE.Mesh(torchPoleGeo, torchPoleMat); pole.position.y = 1; pole.castShadow = true; group.add(pole); 
    const fire = new THREE.Mesh(torchFireGeo, torchFireMat); fire.position.y = 2.3; fire.visible = false; group.add(fire); 
    const light = new THREE.PointLight(0xffaa00, 0, 25); light.position.y = 2.8; group.add(light);
    return { mesh: group, light: light, fire: fire };
}

export function createMadingMesh(title, lines) {
    const group = new THREE.Group(); 

    const poleL = new THREE.Mesh(new THREE.BoxGeometry(0.6, 6, 0.6), luxuryWoodMat); poleL.position.set(-3.5, 3, 0); poleL.castShadow = true; 
    const poleR = new THREE.Mesh(new THREE.BoxGeometry(0.6, 6, 0.6), luxuryWoodMat); poleR.position.set(3.5, 3, 0); poleR.castShadow = true; 
    group.add(poleL, poleR); 
    
    const roof = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.5, 1.8), luxuryWoodMat); roof.position.set(0, 6.1, 0.1); roof.rotation.x = Math.PI / 12; roof.castShadow = true; group.add(roof); 
    const frame = new THREE.Mesh(new THREE.BoxGeometry(6.4, 3.9, 0.1), goldMat); frame.position.set(0, 3.5, 0.1); group.add(frame);

    const canvas = document.createElement('canvas'); canvas.width = 2048; canvas.height = 1024; const ctx = canvas.getContext('2d'); 
    
    ctx.fillStyle = '#fdf6e3'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(139, 69, 19, 0.05)';
    for(let i=0; i<1000; i++) { ctx.beginPath(); ctx.arc(Math.random()*canvas.width, Math.random()*canvas.height, Math.random()*3, 0, Math.PI*2); ctx.fill(); }
    
    ctx.fillStyle = '#b8860b'; 
    [[60,60], [1988,60], [60,964], [1988,964]].forEach(pos => { ctx.beginPath(); ctx.arc(pos[0], pos[1], 25, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth=5; ctx.strokeStyle='#ffd700'; ctx.stroke(); }); 
    
    ctx.fillStyle = '#4a0000'; 
    ctx.font = '900 110px "Palatino Linotype", "Book Antiqua", Palatino, serif'; 
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(title, canvas.width / 2, 160); 
    
    ctx.beginPath(); ctx.moveTo(canvas.width/2 - 500, 230); ctx.lineTo(canvas.width/2 + 500, 230); ctx.lineWidth = 10; ctx.strokeStyle = '#b8860b'; ctx.stroke(); 
    
    ctx.fillStyle = '#000000'; 
    ctx.font = 'bold 64px "Segoe UI", Arial, sans-serif'; 
    ctx.textAlign = 'left'; 
    let startY = 350; 
    lines.forEach(l => { ctx.fillText(l, 150, startY); startY += 120; });
    
    const texture = new THREE.CanvasTexture(canvas); texture.needsUpdate = true; texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 16; 

    const canvasMaterial = new THREE.MeshStandardMaterial({ 
        map: texture, roughness: 1.0, 
        emissive: new THREE.Color(0x444444), emissiveMap: texture, emissiveIntensity: 0.8 
    });

    const board = new THREE.Mesh(new THREE.BoxGeometry(6.0, 3.5, 0.05), [ luxuryWoodMat, luxuryWoodMat, luxuryWoodMat, luxuryWoodMat, canvasMaterial, luxuryWoodMat ]); 
    board.position.set(0, 3.5, 0.16); board.castShadow = true; board.receiveShadow = true; group.add(board); 

    const spotLight = new THREE.SpotLight(0xfffabb, 60); 
    spotLight.position.set(0, 7.0, 4.0); spotLight.target = board; 
    spotLight.angle = Math.PI / 2.5; spotLight.penumbra = 0.8; spotLight.decay = 2; spotLight.distance = 20; spotLight.castShadow = true;
    group.add(spotLight);

    addWall(poleL); addWall(poleR); addWall(board);
    return group;
}

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

    const light = new THREE.PointLight(0xffffff, 100, 25); light.position.set(0, 2.5, 0); group.add(light);

    group.position.set(x, 0, z); group.rotation.y = rotY; scene.add(group);
    shops.push({ position: new THREE.Vector3(x, 0, z) });
    table.updateMatrixWorld(true); addWall(table); 
}

function createHollowHouse(scene, x, z, rotY = 0) { 
    const group = new THREE.Group(); const wallMat = new THREE.MeshStandardMaterial({ color: 0xfff8dc }); 
    const width = 8, depth = 8, height = 4, thickness = 0.5; 
    
    const floor = new THREE.Mesh(new THREE.BoxGeometry(width, 0.2, depth), new THREE.MeshStandardMaterial({ color: 0x654321 })); 
    floor.position.set(0, 0.1, 0); floor.receiveShadow = true; group.add(floor); 
    
    const wallL = new THREE.Mesh(new THREE.BoxGeometry(thickness, height, depth), wallMat); wallL.position.set(-width/2 + thickness/2, height/2, 0); 
    const wallR = new THREE.Mesh(new THREE.BoxGeometry(thickness, height, depth), wallMat); wallR.position.set(width/2 - thickness/2, height/2, 0); 
    const wallB = new THREE.Mesh(new THREE.BoxGeometry(width, height, thickness), wallMat); wallB.position.set(0, height/2, -depth/2 + thickness/2); 
    const wallFL = new THREE.Mesh(new THREE.BoxGeometry((width - 2.5)/2, height, thickness), wallMat); wallFL.position.set(-2.625, height/2, depth/2 - thickness/2); 
    const wallFR = new THREE.Mesh(new THREE.BoxGeometry((width - 2.5)/2, height, thickness), wallMat); wallFR.position.set(2.625, height/2, depth/2 - thickness/2); 
    const wallFTop = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1, thickness), wallMat); wallFTop.position.set(0, 3.5, depth/2 - thickness/2); 
    const walls = [wallL, wallR, wallB, wallFL, wallFR, wallFTop]; walls.forEach(w => { w.castShadow = true; w.receiveShadow = true; group.add(w); }); 
    
    const roof = new THREE.Mesh(new THREE.ConeGeometry(7, 3, 4), new THREE.MeshStandardMaterial({ color: 0x8b0000 })); 
    roof.position.set(0, height + 1.5, 0); roof.rotation.y = Math.PI / 4; roof.castShadow = true; group.add(roof); 
    
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a }); 
    const bed = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.6, 4), bedMat); bed.position.set(-2, 0.4, -1.5); bed.castShadow = true; group.add(bed); 
    const pillow = new THREE.Mesh(new THREE.BoxGeometry(2, 0.2, 1), new THREE.MeshStandardMaterial({ color: 0xffffff })); pillow.position.set(-2, 0.8, -2.8); group.add(pillow); 
    const table = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 2), new THREE.MeshStandardMaterial({ color: 0x5c4033 })); table.position.set(2, 0.6, -2); table.castShadow = true; group.add(table); 
    
    const indoorLight = new THREE.PointLight(0xffaa55, 50, 20); indoorLight.position.set(0, 3, 0); group.add(indoorLight); 
    
    group.position.set(x, 0, z); group.rotation.y = rotY; scene.add(group); group.updateMatrixWorld(true); 
    
    walls.forEach(w => addWall(w)); addWall(bed); addWall(table); solidGrounds.push(floor); 
    
    const triggerBox = new THREE.Box3().setFromObject(floor); triggerBox.max.y += 5; interactiveHouses.push({ box: triggerBox, roof: roof }); 
    bed.updateMatrixWorld(true); const bedTrigger = new THREE.Box3().setFromObject(bed); bedTrigger.expandByScalar(1.5); 
    const bedCenter = new THREE.Vector3(); bed.getWorldPosition(bedCenter); bedCenter.y += 0.8; beds.push({ triggerBox: bedTrigger, sleepPosition: bedCenter, sleepRotY: rotY + Math.PI/2 }); 
}

function createTent(scene, x, z, rotY = 0) { 
    const tent = new THREE.Mesh(new THREE.ConeGeometry(2.5, 3, 4), new THREE.MeshStandardMaterial({ color: 0xFF8C00 })); 
    tent.position.set(x, 1.5, z); tent.rotation.y = rotY + Math.PI / 4; tent.castShadow = true; tent.receiveShadow = true; 
    scene.add(tent); addWall(tent); solidGrounds.push(tent); 
}

function createHill(scene, x, z, scale) { 
    const hill = new THREE.Mesh(new THREE.SphereGeometry(10, 16, 16), new THREE.MeshStandardMaterial({ color: 0x55aa55 })); 
    hill.position.set(x, 0, z); hill.scale.set(scale, scale * 0.4, scale); hill.receiveShadow = true; 
    scene.add(hill); solidGrounds.push(hill); 
}

function createMountain(scene, x, z) { 
    const mtn = new THREE.Mesh(new THREE.ConeGeometry(40, 50, 8), new THREE.MeshStandardMaterial({ color: 0x696969 })); 
    mtn.position.set(x, 25, z); mtn.castShadow = true; mtn.receiveShadow = true; 
    scene.add(mtn); solidGrounds.push(mtn); 
}

function createLake(scene, x, z, radius) { 
    const water = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.5, 32), new THREE.MeshStandardMaterial({ color: 0x1E90FF, transparent: true, opacity: 0.8 })); 
    water.position.set(x, 0.1, z); scene.add(water); 
    
    const sand = new THREE.Mesh(new THREE.TorusGeometry(radius + 1, 1, 8, 32), new THREE.MeshStandardMaterial({ color: 0xEEDC82 })); 
    sand.position.set(x, 0.15, z); sand.rotation.x = Math.PI / 2; 
    scene.add(sand); solidGrounds.push(sand); 
}