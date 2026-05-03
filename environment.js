// environment.js
import * as THREE from 'three';

export const solidGrounds = []; 
export const wallObjects = [];  
export const interactiveHouses = [];
export const beds = []; 
export const torchLights = []; 

function addWall(mesh) { 
    mesh.updateMatrixWorld(true);
    wallObjects.push(new THREE.Box3().setFromObject(mesh)); 
}

export function createWorld(scene) {
    const ocean = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshStandardMaterial({ color: 0x006994, transparent: true, opacity: 0.8 }));
    ocean.rotation.x = -Math.PI / 2; ocean.position.y = -2;
    scene.add(ocean); solidGrounds.push(ocean);

    const island = new THREE.Mesh(new THREE.CylinderGeometry(150, 160, 4, 64), new THREE.MeshStandardMaterial({ color: 0x4B8B3B }));
    island.position.y = -2; island.receiveShadow = true;
    scene.add(island); solidGrounds.push(island);

    createMading(scene, "✨ ABOUT ME ✨", ["👋 Hi! I am Khoirony Arief", "💻 Software Engineer based in Bandung.", "🏢 Working at Far Capital (Property Tech).", "🚀 Fast Learner & Problem Solver."], 0, -10, 0);
    createMading(scene, "🛠️ TECH SKILLS", ["⚡ TALL Stack: Tailwind, AlpineJS, Laravel, Livewire", "🧩 No-Code: Bubble.io, Make, n8n", "☁️ Cloud/Deploy: VPS, Docker, AWS S3, CI/CD", "🎮 Game Dev: Unity, C#, 3D Math"], -20, -5, Math.PI / 3);
    createMading(scene, "🏢 WORK EXPERIENCE", ["▪ Far Capital (Property HUB) - Full-time", "   Built platforms for property buying & agents.", "▪ Far Capital (Wetopia & Matchbank)", "   Fintech screening & short-term rentals.", "▪ Govt of Jakarta - Freelance", "   Marine Fuel Monitoring System Dashboard."], 25, 5, -Math.PI / 4);
    createMading(scene, "🏆 WEEKEND PROJECTS", ["1️⃣ Personal Profile Game (WebGL / Unity)", "    Interactive 3D Portfolio Experience.", "2️⃣ Fintrac (Financial Report System)", "    Cash flow tracker for FIRE planning.", "3️⃣ Object Detection (Tensorflow JS)", "    Real-time browser computer vision."], 0, -35, 0);

    createHollowHouse(scene, -25, -15, Math.PI / 4);  
    createHollowHouse(scene, -15, -25, -Math.PI / 6); 
    createTent(scene, -35, -5, 0);
    createLake(scene, 35, 10, 15);
    createTent(scene, 45, 20, -Math.PI/4);

    createMountain(scene, 0, -80); 
    createMountain(scene, 80, -40); 
    createHill(scene, 15, -45, 1.5); 
    createHill(scene, -30, 20, 2);

    createTorch(scene, 5, 5);      
    createTorch(scene, -5, 5);     
    createTorch(scene, -18, -12);  
    createTorch(scene, -12, -18);  
    createTorch(scene, 30, 10);    
    createTorch(scene, 0, -5);     

    // === SISTEM POHON SINKRON (SEEDED RANDOM) ===
    // Mengganti Math.random() dengan Seeded Random agar posisi pohon sama persis di tiap perangkat.
    let seed = 12345; // Kamu bisa mengubah angka ini untuk mendapatkan formasi map yang berbeda
    function seededRandom() {
        let x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    for (let i = 0; i < 100; i++) {
        // Kita menggunakan seededRandom() sebagai pengganti Math.random()
        let x = (seededRandom() - 0.5) * 250; 
        let z = (seededRandom() - 0.5) * 250;
        
        if (Math.sqrt(x*x + z*z) > 15 && (x > -15 || x < -35) && (x < 20 || x > 50)) {
            createTree(scene, x, z);
        }
    }
}

// === FUNGSI PEMBUAT OBJEK ===

export function createPigMesh() {
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
    
    return { mesh: pig, legs: [legFL, legFR, legBL, legBR] };
}

function createTorch(scene, x, z) {
    const group = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2, 8), new THREE.MeshStandardMaterial({ color: 0x5c4033 }));
    pole.position.y = 1; pole.castShadow = true; group.add(pole);

    const fire = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 8), new THREE.MeshBasicMaterial({ color: 0xff8c00 }));
    fire.position.y = 2.2; fire.visible = false; group.add(fire);

    const light = new THREE.PointLight(0xffaa00, 0, 15); 
    light.position.y = 2.5; group.add(light);

    group.position.set(x, 0, z); scene.add(group);
    torchLights.push({ light: light, fire: fire });
    pole.updateMatrixWorld(true); addWall(pole);
}

function createHollowHouse(scene, x, z, rotY = 0) {
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
    const bedTrigger = new THREE.Box3().setFromObject(bed); bedTrigger.expandByScalar(1.5); 
    const bedCenter = new THREE.Vector3(); bed.getWorldPosition(bedCenter); bedCenter.y += 0.8; 
    beds.push({ triggerBox: bedTrigger, sleepPosition: bedCenter, sleepRotY: rotY + Math.PI/2 });
}

function createTent(scene, x, z, rotY = 0) {
    const tent = new THREE.Mesh(new THREE.ConeGeometry(2.5, 3, 4), new THREE.MeshStandardMaterial({ color: 0xFF8C00 }));
    tent.position.set(x, 1.5, z); tent.rotation.y = rotY + Math.PI / 4;
    tent.castShadow = true; tent.receiveShadow = true;
    scene.add(tent); addWall(tent); solidGrounds.push(tent);
}

function createHill(scene, x, z, scale) {
    const hill = new THREE.Mesh(new THREE.SphereGeometry(10, 16, 16), new THREE.MeshStandardMaterial({ color: 0x55aa55 }));
    hill.position.set(x, 0, z); hill.scale.set(scale, scale * 0.4, scale); 
    hill.receiveShadow = true; scene.add(hill); solidGrounds.push(hill);
}

function createMountain(scene, x, z) {
    const mtn = new THREE.Mesh(new THREE.ConeGeometry(40, 50, 8), new THREE.MeshStandardMaterial({ color: 0x696969 }));
    mtn.position.set(x, 25, z); mtn.castShadow = true; mtn.receiveShadow = true;
    scene.add(mtn); solidGrounds.push(mtn);
}

function createLake(scene, x, z, radius) {
    const water = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.5, 32), new THREE.MeshStandardMaterial({ color: 0x1E90FF, transparent: true, opacity: 0.8 }));
    water.position.set(x, -0.5, z); scene.add(water); solidGrounds.push(water);
    const sand = new THREE.Mesh(new THREE.TorusGeometry(radius + 1, 1, 8, 32), new THREE.MeshStandardMaterial({ color: 0xEEDC82 }));
    sand.position.set(x, -0.2, z); sand.rotation.x = Math.PI / 2;
    scene.add(sand); solidGrounds.push(sand);
}

function createTree(scene, x, z) {
    const trunk = new THREE.Mesh(new THREE.BoxGeometry(1, 3, 1), new THREE.MeshStandardMaterial({ color: 0x8B4513 }));
    trunk.position.set(x, 1.5, z); trunk.castShadow = true; scene.add(trunk); 
    trunk.updateMatrixWorld(true); addWall(trunk);
    const leaves = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), new THREE.MeshStandardMaterial({ color: 0x228B22 }));
    leaves.position.set(x, 4, z); leaves.castShadow = true; scene.add(leaves);
}

function createMading(scene, title, lines, x, z, rotY = 0) {
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