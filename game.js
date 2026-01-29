// REDA ENGINE - MEGA PROJECT v1.0
let scene, camera, renderer, player, clock;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false, canJump = false;
let velocity = new THREE.Vector3(), direction = new THREE.Vector3();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xaaccff); // سماء مبدئية
    scene.fog = new THREE.FogExp2(0xaaccff, 0.015); // ضباب واقعي
    clock = new THREE.Clock();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    
    renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // 1. الإضاءة الديناميكية (Dynamic Sunlight)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(50, 100, 50);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 100; dirLight.shadow.camera.bottom = -100;
    dirLight.shadow.camera.left = -100; dirLight.shadow.camera.right = 100;
    scene.add(dirLight);

    // 2. بناء العالم المفتوح (The Terrain)
    const groundGeo = new THREE.PlaneGeometry(1000, 1000, 50, 50);
    const groundMat = new THREE.MeshPhongMaterial({ color: 0x55aa55 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // إضافة كائنات عشوائية (صخور وأشجار) لتأثيث العالم
    for(let i=0; i<100; i++) {
        let size = Math.random() * 2 + 1;
        let obs = new THREE.Mesh(
            new THREE.BoxGeometry(size, size*2, size),
            new THREE.MeshPhongMaterial({color: 0x888888})
        );
        obs.position.set(Math.random()*400-200, size, Math.random()*400-200);
        obs.castShadow = true;
        scene.add(obs);
    }

    // 3. الشخصية الرئيسية (The Avatar)
    player = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.5, 1, 4, 8), new THREE.MeshPhongMaterial({color: 0x3366ff}));
    body.position.y = 1; body.castShadow = true;
    player.add(body);
    scene.add(player);

    // نظام التحكم
    document.addEventListener('keydown', (e) => onKey(e.code, true));
    document.addEventListener('keyup', (e) => onKey(e.code, false));
    document.addEventListener('mousedown', () => document.body.requestPointerLock());
    document.addEventListener('mousemove', (e) => {
        if(document.pointerLockElement) player.rotation.y -= e.movementX * 0.003;
    });

    animate();
}

function onKey(code, val) {
    if(code === 'KeyW') moveForward = val;
    if(code === 'KeyS') moveBackward = val;
    if(code === 'KeyA') moveLeft = val;
    if(code === 'KeyD') moveRight = val;
    if(code === 'Space' && val && canJump) { velocity.y += 15; canJump = false; }
}

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    // فيزياء الحركة (Movement Physics)
    velocity.y -= 30 * delta; // جاذبية قوية
    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();

    if (moveForward || moveBackward) velocity.z -= direction.z * 100 * delta;
    if (moveLeft || moveRight) velocity.x -= direction.x * 100 * delta;

    player.translateX(-velocity.x * delta);
    player.translateZ(-velocity.z * delta);
    player.position.y += velocity.y * delta;

    if (player.position.y < 0) {
        velocity.y = 0; player.position.y = 0; canJump = true;
    }

    velocity.x *= 0.9; velocity.z *= 0.9; // احتكاك الأرض

    // كاميرا روبلوكس الاحترافية (Camera Orbit)
    const idealOffset = new THREE.Vector3(0, 5, 10).applyMatrix4(player.matrixWorld);
    camera.position.lerp(idealOffset, 0.1);
    camera.lookAt(player.position.x, player.position.y + 2, player.position.z);

    renderer.render(scene, camera);
}

init();
