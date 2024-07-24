import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import TWEEN from '@tweenjs/tween.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
const gltfLoader = new GLTFLoader();
let loadedModel = null;

gltfLoader.load(
    '/models/sci_-_fi_buggy.glb',
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
    canvas: canvas,
    antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.xr.enabled = true;

document.body.appendChild(VRButton.createButton(renderer));

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const controller1 = renderer.xr.getController(0);
controller1.addEventListener('selectstart', onSelectStart);
controller1.addEventListener('selectend', onSelectEnd);
scene.add(controller1);

const controller2 = renderer.xr.getController(1);
controller2.addEventListener('selectstart', onSelectStart);
controller2.addEventListener('selectend', onSelectEnd);
scene.add(controller2);

canvas.addEventListener('click', onMouseOrTouch);
canvas.addEventListener('touchstart', (event) => {
    event.preventDefault();
    onMouseOrTouch(event.touches[0]);
}, false);

function onMouseOrTouch(event) {
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
}

function onSelectStart(event) {
    const controller = event.target;
    const intersections = getIntersections(controller);

    if (intersections.length > 0) {
        const intersection = intersections[0];
        const intersected = intersection.object;
        const intersectPoint = intersection.point;
        console.log('Object clicked:', intersected);
        console.log('Intersection point:', intersectPoint);

        if (intersected.material) {
            intersected.material.color.set(0xff0000);
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
}

function onSelectEnd(event) {
    // You can add functionality here if needed
}

function getIntersections(controller) {
    const tempMatrix = new THREE.Matrix4();
    tempMatrix.identity().extractRotation(controller.matrixWorld);

    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    return raycaster.intersectObjects(scene.children, true);
}

const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    controls.update();
    TWEEN.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();
