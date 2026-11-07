import * as THREE from "three";
import { OrbitControls } from "./vendor/OrbitControls.js";
import { CSS2DRenderer } from "./vendor/CSS2DRenderer.js";
import { createFeed } from "./feed.js?v=original1";
import { mountHud } from "./hud.js?v=original1";
import { buildOffice } from "./office.js?v=original1";
import { createStaff } from "./avatars.js?v=original1";
import { detectAutoMode, modeFromQuery, topicFromLocation } from "./config.js?v=original1";

const host = document.getElementById("canvas-host");
const overlay = document.getElementById("ui");
const loader = document.getElementById("loader");

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
host.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.className = "label-layer";
document.body.appendChild(labelRenderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xb9c5d0, 38, 72);

const aspect = window.innerWidth / window.innerHeight;
const frustum = 22;
const camera = new THREE.OrthographicCamera(
  (-frustum * aspect) / 2,
  (frustum * aspect) / 2,
  frustum / 2,
  -frustum / 2,
  0.1,
  200
);
camera.position.set(26, 24, 26);
camera.lookAt(0, 0.4, 0.4);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.35, 0.2);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minPolarAngle = 0.55;
controls.maxPolarAngle = 1.15;
controls.minZoom = 0.55;
controls.maxZoom = 2.4;
controls.maxAzimuthAngle = Math.PI * 0.85;
controls.minAzimuthAngle = -Math.PI * 0.15;
controls.update();

const ambient = new THREE.AmbientLight(0xffffff, 0.35);
scene.add(ambient);
const hemi = new THREE.HemisphereLight(0xfff3e0, 0x8a7a64, 1.0);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff0d2, 1.5);
sun.position.set(18, 26, 10);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 2;
sun.shadow.camera.far = 70;
sun.shadow.camera.left = -28;
sun.shadow.camera.right = 28;
sun.shadow.camera.top = 24;
sun.shadow.camera.bottom = -24;
sun.shadow.bias = -0.0008;
scene.add(sun);

const office = buildOffice(scene);
const staff = createStaff(scene);
const hud = mountHud(overlay);

let modeChoice = modeFromQuery();
let resolvedMode = modeChoice === "auto" ? detectAutoMode() : modeChoice;
let feedState = {
  status: "connecting",
  lastError: "",
  usage: null,
  doneCount: 0,
  doneByBot: {},
  working: 0,
  waiting: 0,
  errors: 0,
  system: "待命中",
  systemKind: "idle",
  visuals: {},
  activity: [],
};

function applyMode(mode) {
  resolvedMode = mode;
  const pal = office.applyTheme(mode);
  renderer.setClearColor(pal.clear, 1);
  scene.background = new THREE.Color(pal.clear);
  scene.fog.color.setHex(pal.clear);
  hemi.color.setHex(pal.hemiSky);
  hemi.groundColor.setHex(pal.hemiGround);
  hemi.intensity = pal.hemi;
  ambient.intensity = pal.ambient;
  sun.color.setHex(pal.sun);
  sun.intensity = pal.sunIntensity;
  sun.position.set(...pal.sunPos);
  renderer.toneMappingExposure = pal.exposure;
}

applyMode(resolvedMode);

const topic = topicFromLocation();
let firstVisuals = true;
const feed = createFeed(topic, (state) => {
  feedState = state;
  staff.applyVisuals(state.visuals, firstVisuals);
  firstVisuals = false;
  office.updateDeptCounts(hud.deptCounts(state));
  hud.render(state, modeChoice, resolvedMode);
});

hud.buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    modeChoice = btn.dataset.mode;
    const mode = modeChoice === "auto" ? detectAutoMode() : modeChoice;
    applyMode(mode);
    hud.render(feedState, modeChoice, resolvedMode);
  });
});

window.addEventListener("hashchange", () => {
  location.reload();
});

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const a = w / h;
  camera.left = (-frustum * a) / 2;
  camera.right = (frustum * a) / 2;
  camera.top = frustum / 2;
  camera.bottom = -frustum / 2;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  labelRenderer.setSize(w, h);
}
window.addEventListener("resize", resize);

let last = performance.now();
let ready = false;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  controls.update();
  office.tick(now / 1000);
  staff.tick(dt, now / 1000);
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
  if (!ready) {
    ready = true;
    loader.classList.add("hide");
    window.__OFFICE_READY__ = true;
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

feed.start().finally(() => {
  const snap = feed.snapshot();
  staff.applyVisuals(snap.visuals, true);
  window.__OFFICE_FEED__ = snap;
});

window.__OFFICE__ = {
  topic,
  get state() {
    return feed.snapshot();
  },
  positions() {
    return staff.actors.map((a) => ({
      id: a.spec.id,
      state: a.state,
      pose: a.pose,
      x: +a.mesh.position.x.toFixed(2),
      z: +a.mesh.position.z.toFixed(2),
    }));
  },
  setMode(mode) {
    modeChoice = mode;
    applyMode(mode === "auto" ? detectAutoMode() : mode);
    hud.render(feedState, modeChoice, resolvedMode);
  },
};
