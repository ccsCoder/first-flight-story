import  './style.css';

import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


// scene, camera, renderer
const scene = new THREE.Scene();

// camera
const camera = new THREE.PerspectiveCamera(
  50, // view frustrum
  window.innerWidth / window.innerHeight, // aspect ratio
  0.1, // near plane
  1000 // far plane
);

// renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg')
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
scene.add(controls);

// Load our Plane
const gltfLoader = new GLTFLoader();
gltfLoader.load('models/wright_flyer-web_resolution-gltf/wright_flyer-full_resolution.gltf', function(gltf) {
  const root = gltf.scene;
  scene.add(root);
  const box = new THREE.Box3().setFromObject(root);
  const boxSize = box.getSize(new THREE.Vector3()).length();
  const boxCenter = box.getCenter(new THREE.Vector3());
  // set the camera to frame the box
  frameArea(boxSize * 0.8, boxSize, boxCenter, camera);

  // update the Trackball controls to handle the new size
  controls.maxDistance = boxSize * 10;
  controls.target.copy(boxCenter);
  controls.update();
});

function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
  const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
  const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
  const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
  // compute a unit vector that points in the direction the camera is now
  // in the xz plane from the center of the box
  const direction = (new THREE.Vector3())
      .subVectors(camera.position, boxCenter)
      .multiply(new THREE.Vector3(1, 0, 1))
      .normalize();

  // move the camera to a position distance units way from the center
  // in whatever direction the camera was from the center already
  camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

  // pick some near and far values for the frustum that
  // will contain the box.
  camera.near = boxSize / 100;
  camera.far = boxSize * 100;

  camera.updateProjectionMatrix();

  // point the camera to look at the center of the box
  camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
}

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

const skyColor = 0xe7e7e7;
const groundColor = 0x2B2929;  // brownish orange
const intensity = 1;
const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
light.castShadow = true;
scene.add(light);

const ambientLight = new THREE.PointLight(0xffffff);
light.position.set( 10, 10, 10);
scene.add(ambientLight);

// resize handler
window.addEventListener('resize', function() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

function refresh()  {
  requestAnimationFrame(refresh);
  controls.update(); // make it move iwhtr mosaeu
  renderer.render(scene, camera);
}

refresh();

// ----------------------------------------------------------------------------------- //

/** page interactions */

document.addEventListener('DOMContentLoaded', init);
// animate the drawer

function onMenuToggled(e) {
  const elem = this || e.target;
  elem.classList.toggle('opened');
  elem.setAttribute('aria-expanded', elem.classList.contains('opened'));

  const menuContent = document.querySelector('#aside-menu');

  // set focus to first menu item / menu, toggle menu.
  if (elem.classList.contains('opened')) {
    menuContent.style.left = '0';
    document.querySelector('#toggle-animation').focus();
  } else {
    menuContent.style.left = '-50%';
    elem.focus();
  }
}

function init() {
  const tooltip = document.querySelector('.tip-container');
  document.querySelector('#menu-button').addEventListener('click', onMenuToggled);
  document.querySelector('#menu-button').addEventListener('keydown', function(e) {
    if (e.key == 'ArrowDown') {
      onMenuToggled(e);
      return;
    }
  });
  document.addEventListener('keydown', function(e) {
    const elem = document.querySelector('#menu-button');
    if (e.key == 'Escape') { // escape
      elem.classList.remove('opened');
      document.querySelector('#aside-menu').style.left = '-50%';
      elem.focus();
    }
  });
  // hint
  setTimeout(() => {
    tooltip.style.opacity = 1;
  }, 3000);
  setTimeout(() => {
    tooltip.remove();
  }, 8000);

}

