import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as Stats from 'stats.js';
import { createPlanet } from './planet';
import initGUI from './gui';

// Initialization
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x222222);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.z = 5;

addEventListener('resize', onWindowResize);

const controls = new OrbitControls(camera, renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
const pointLight = new THREE.PointLight(0xffffff, 0.8);
pointLight.position.set(250, 250, 250);
scene.add(ambientLight);
scene.add(pointLight);

const planet = createPlanet();
scene.add(planet.mesh);

// GUI
initGUI(planet);

// Stats
const stats = new Stats();
stats.showPanel(1);
stats.dom.style.left = '15px';
document.body.appendChild(stats.dom);

// Begin render loop
animate();

function animate(): void {
  requestAnimationFrame(animate);

  stats.begin();

  controls.update();
  planet.mesh.rotation.y += 0.001;
  renderer.render(scene, camera);

  stats.end();
}

function onWindowResize(): void {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
