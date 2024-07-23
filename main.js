import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import TWEEN from '@tweenjs/tween.js';

const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
const gltfLoader = new GLTFLoader();
let loadedModel = null;

gltfLoader.load(
    'models/sci_-_fi_buggy.glb', 
    (gltf) => {
        loadedModel = gltf.scene;
        scene.add(loadedModel);
        console.log('Model loaded:', loadedModel);
    }
);

const ambientLight = new THREE.AmbientLight(0xffffff, 4.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xAfffff, 8.1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(3, 3, 3);
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

canvas.addEventListener('click', (event) => {
    mouse.x = (event.clientX / sizes.width) * 2 - 1;
    mouse.y = -(event.clientY / sizes.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        const intersectPoint = intersects[0].point;
        console.log('Object clicked:', clickedObject);
        console.log('Intersection point:', intersectPoint);

        if (clickedObject.material) {
            clickedObject.material.color.set(0xff0000);
        }

        new TWEEN.Tween(camera.position)
            .to({
                x: intersectPoint.x + 3, 
                y: intersectPoint.y + 3,
                z: intersectPoint.z + 3
            }, 1000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();

        new TWEEN.Tween(controls.target)
            .to({
                x: intersectPoint.x,
                y: intersectPoint.y,
                z: intersectPoint.z
            }, 1000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onUpdate(() => {
                controls.update();
            })
            .start();
    }
});

const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    controls.update();
    TWEEN.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();
