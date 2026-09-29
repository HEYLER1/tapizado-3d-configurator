import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import './style.css';

const state = {
  design: 'rombo',
  designName: 'Rombo Andino',
  base: '#d9d7d0',
  accent: '#777b80',
  stitch: '#f4f0e8',
  material: 'cuero',
  materialName: 'Tacto cuero',
  zone: 'all',
  zoneName: 'asiento completo',
};

const canvas = document.querySelector('#seatCanvas');
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
camera.position.set(5.4, 3.45, 8.9);
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 2.25, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.enablePan = false;
controls.minDistance = 6;
controls.maxDistance = 13;
controls.minPolarAngle = Math.PI * 0.24;
controls.maxPolarAngle = Math.PI * 0.56;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.72;

scene.add(new THREE.HemisphereLight(0xe6efff, 0x353943, 3.5));
scene.add(new THREE.AmbientLight(0xffffff, 1.05));
const key = new THREE.DirectionalLight(0xffffff, 4.2);
key.position.set(4, 8, 6);
key.castShadow = true;
key.shadow.mapSize.set(1024, 1024);
scene.add(key);
const rim = new THREE.DirectionalLight(0xf12840, 2.1);
rim.position.set(-5, 4, -4);
scene.add(rim);
const fill = new THREE.DirectionalLight(0xaec8ff, 2.2);
fill.position.set(-4, 5, 5);
scene.add(fill);

const floor = new THREE.Mesh(new THREE.CircleGeometry(4.6, 64), new THREE.MeshStandardMaterial({ color: 0x171a1f, roughness: 0.8, metalness: 0.1, transparent: true, opacity: 0.7 }));
floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.24;
floor.receiveShadow = true;
scene.add(floor);

const seat = new THREE.Group();
seat.rotation.y = -0.16;
scene.add(seat);

const baseMaterial = new THREE.MeshPhysicalMaterial({ color: state.base, roughness: 0.5, metalness: 0.02, clearcoat: 0.2, clearcoatRoughness: 0.55 });
const accentMaterial = new THREE.MeshPhysicalMaterial({ color: state.accent, roughness: 0.48, metalness: 0.02, clearcoat: 0.18 });
const centerMaterial = new THREE.MeshPhysicalMaterial({ color: state.base, roughness: 0.62, metalness: 0, bumpScale: 0.045 });
const stitchMaterial = new THREE.MeshStandardMaterial({ color: state.stitch, roughness: 0.7 });
const darkPlastic = new THREE.MeshStandardMaterial({ color: 0x0a0b0e, roughness: 0.6, metalness: 0.25 });

const meshes = { base: [], accent: [], center: [], stitch: [] };

function addMesh(geometry, material, position, rotation = [0, 0, 0], parent = seat, bucket = null) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  if (bucket) meshes[bucket].push(mesh);
  return mesh;
}

function extruded(shape, depth, bevel, material, position, rotation = [0, 0, 0], parent = seat, bucket = null) {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    curveSegments: 20,
    bevelEnabled: true,
    bevelSegments: 6,
    bevelSize: bevel,
    bevelThickness: bevel,
    steps: 1,
  });
  geometry.translate(0, 0, -depth / 2);
  geometry.computeVertexNormals();
  return addMesh(geometry, material, position, rotation, parent, bucket);
}

function backShape(inset = 0) {
  const s = new THREE.Shape();
  const lower = 1.02 - inset * .45;
  const shoulder = 1.2 - inset;
  s.moveTo(-lower, .06 + inset);
  s.bezierCurveTo(-1.12 + inset, .72, -1.1 + inset, 1.8, -shoulder, 2.58 - inset);
  s.bezierCurveTo(-1.22 + inset, 2.92, -1.0 + inset, 3.2 - inset, -.72 + inset, 3.28 - inset);
  s.bezierCurveTo(-.35, 3.36 - inset, .35, 3.36 - inset, .72 - inset, 3.28 - inset);
  s.bezierCurveTo(1.0 - inset, 3.2 - inset, 1.22 - inset, 2.92, shoulder, 2.58 - inset);
  s.bezierCurveTo(1.1 - inset, 1.8, 1.12 - inset, .72, lower, .06 + inset);
  s.bezierCurveTo(.62, -.1 + inset, -.62, -.1 + inset, -lower, .06 + inset);
  s.closePath();
  return s;
}

function cushionShape(inset = 0) {
  const s = new THREE.Shape();
  const side = 1.34 - inset;
  s.moveTo(-1.02 + inset, -1.13 + inset);
  s.bezierCurveTo(-side, -.86, -side, .58, -1.06 + inset, 1.08 - inset);
  s.bezierCurveTo(-.76, 1.35 - inset, .76, 1.35 - inset, 1.06 - inset, 1.08 - inset);
  s.bezierCurveTo(side, .58, side, -.86, 1.02 - inset, -1.13 + inset);
  s.bezierCurveTo(.68, -1.3 + inset, -.68, -1.3 + inset, -1.02 + inset, -1.13 + inset);
  s.closePath();
  return s;
}

// Low-profile rails and the dark lower shell found on modern touring seats.
addMesh(new RoundedBoxGeometry(2.72, .48, 2.3, 6, .16), darkPlastic, [0, .12, -.02]);
addMesh(new RoundedBoxGeometry(.16, .14, 2.7, 4, .04), darkPlastic, [-.87, -.17, -.02]);
addMesh(new RoundedBoxGeometry(.16, .14, 2.7, 4, .04), darkPlastic, [.87, -.17, -.02]);

// Deep, softly rolled cushion with a separate quilted leather centre.
extruded(cushionShape(), .5, .13, baseMaterial, [0, .69, .08], [Math.PI / 2, 0, 0], seat, 'base');
extruded(cushionShape(.28), .18, .1, centerMaterial, [0, 1.02, .05], [Math.PI / 2, 0, 0], seat, 'center');

// Lower side valances stay dark, like the CGTrader touring-seat reference.
addMesh(new RoundedBoxGeometry(.28, .55, 2.12, 6, .1), darkPlastic, [-1.25, .42, -.02]);
addMesh(new RoundedBoxGeometry(.28, .55, 2.12, 6, .1), darkPlastic, [1.25, .42, -.02]);

// Tapered automotive backrest: outer shell and inset panel share the same silhouette.
const back = new THREE.Group();
back.position.set(0, 1.19, -1.08);
back.rotation.x = -.1;
seat.add(back);
extruded(backShape(), .64, .14, baseMaterial, [0, 0, 0], [0, 0, 0], back, 'base');
extruded(backShape(.27), .13, .09, centerMaterial, [0, .03, .39], [0, 0, 0], back, 'center');

// Slim side bolsters: less racing-seat, more premium road-car silhouette.
const leftAccent = new THREE.Shape();
leftAccent.moveTo(-1.0, .28); leftAccent.bezierCurveTo(-1.08, 1.15, -1.02, 2.25, -.96, 2.7); leftAccent.lineTo(-.72, 2.58); leftAccent.bezierCurveTo(-.79, 1.72, -.78, .88, -.7, .34); leftAccent.closePath();
extruded(leftAccent, .12, .045, accentMaterial, [0, 0, .47], [0, 0, 0], back, 'accent');
const rightAccent = leftAccent.clone();
const rightMesh = extruded(rightAccent, .12, .045, accentMaterial, [0, 0, .47], [0, 0, 0], back, 'accent');
rightMesh.scale.x = -1;

// Broad shoulder pad and a clearly separated adjustable headrest.
addMesh(new RoundedBoxGeometry(2.35, .52, .68, 10, .2), baseMaterial, [0, 4.02, -1.18], [-.08, 0, 0], seat, 'base');
addMesh(new THREE.CapsuleGeometry(.045, .5, 8, 12), darkPlastic, [-.42, 4.42, -1.46]);
addMesh(new THREE.CapsuleGeometry(.045, .5, 8, 12), darkPlastic, [.42, 4.42, -1.46]);
const head = new THREE.Shape();
head.moveTo(-.72, 0); head.bezierCurveTo(-.9, .1, -.86, .88, -.62, 1.02); head.bezierCurveTo(-.33, 1.18, .33, 1.18, .62, 1.02); head.bezierCurveTo(.86, .88, .9, .1, .72, 0); head.bezierCurveTo(.4, -.12, -.4, -.12, -.72, 0); head.closePath();
extruded(head, .68, .14, baseMaterial, [0, 4.28, -1.4], [-.08, 0, 0], seat, 'base');
const headInset = head.clone();
const headCenter = extruded(headInset, .08, .055, centerMaterial, [0, 4.28, -1.01], [-.08, 0, 0], seat, 'center');
headCenter.scale.set(.78, .7, 1);

// Visible integrated seat belt, lower buckle and side adjustment controls.
const beltMaterial = new THREE.MeshStandardMaterial({ color: 0x17181b, roughness: .88, metalness: 0 });
function beltSegment(a, b, width = .14) {
  const start = new THREE.Vector3(...a);
  const end = new THREE.Vector3(...b);
  const midpoint = start.clone().add(end).multiplyScalar(.5);
  const length = start.distanceTo(end);
  const mesh = addMesh(new RoundedBoxGeometry(width, length, .045, 4, .018), beltMaterial, [midpoint.x, midpoint.y, midpoint.z]);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(start).normalize());
  return mesh;
}
beltSegment([1.26, 4.22, -1.33], [1.45, 2.35, -1.23], .16);
beltSegment([1.45, 2.35, -1.23], [1.35, .52, -.62], .16);
addMesh(new RoundedBoxGeometry(.24, .18, .1, 4, .04), darkPlastic, [1.44, 2.37, -1.2], [0, 0, -.04]);
addMesh(new RoundedBoxGeometry(.24, .42, .2, 5, .06), darkPlastic, [-1.18, .82, .56], [0, 0, -.14]);
addMesh(new RoundedBoxGeometry(.14, .12, .1, 4, .03), new THREE.MeshStandardMaterial({ color: 0xe73646, roughness: .45 }), [-1.18, 1.04, .57]);
const controlsPanel = addMesh(new RoundedBoxGeometry(.1, .3, .68, 5, .04), darkPlastic, [1.41, .55, .24], [0, 0, 0]);
addMesh(new RoundedBoxGeometry(.06, .09, .24, 3, .025), new THREE.MeshStandardMaterial({ color: 0xaeb2b5, roughness: .35, metalness: .55 }), [1.47, .57, .1]);
addMesh(new RoundedBoxGeometry(.06, .11, .12, 3, .025), new THREE.MeshStandardMaterial({ color: 0xaeb2b5, roughness: .35, metalness: .55 }), [1.47, .57, .42]);

// Piping follows the real panel edges and remains visible from oblique angles.
function line(points, parent = seat, radius = .022) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x,y,z]) => new THREE.Vector3(x,y,z)));
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 52, radius, 8, false), stitchMaterial);
  mesh.castShadow = true;
  parent.add(mesh);
  meshes.stitch.push(mesh);
}
line([[-.8,1.04,1.0],[-.88,1.05,.2],[-.76,1.03,-.92]]);
line([[.8,1.04,1.0],[.88,1.05,.2],[.76,1.03,-.92]]);
line([[-.7,.18,.5],[-.76,1.55,.51],[-.55,2.88,.5]], back);
line([[.7,.18,.5],[.76,1.55,.51],[.55,2.88,.5]], back);

function textureFor(design, color, stitch) {
  const size = 512;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = stitch;
  ctx.lineWidth = 5;
  ctx.globalAlpha = .9;
  if (design === 'rombo') {
    for (let y = -70; y < size + 70; y += 70) for (let x = -70; x < size + 70; x += 70) {
      ctx.beginPath(); ctx.moveTo(x, y + 35); ctx.lineTo(x + 35, y); ctx.lineTo(x + 70, y + 35); ctx.lineTo(x + 35, y + 70); ctx.closePath(); ctx.stroke();
    }
  } else if (design === 'titicaca') {
    for (let y = 55; y < size; y += 82) { ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(145, y); ctx.lineTo(180, y - 24); ctx.lineTo(332, y - 24); ctx.lineTo(367, y); ctx.lineTo(482, y); ctx.stroke(); }
  } else if (design === 'mantaro') {
    ctx.lineWidth = 22; ctx.strokeStyle = state.accent; ctx.globalAlpha = .95;
    [178,334].forEach(x => { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,size); ctx.stroke(); });
    ctx.lineWidth = 4; ctx.strokeStyle = stitch;
    [164,192,320,348].forEach(x => { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,size); ctx.stroke(); });
  } else {
    ctx.lineWidth = 3;
    for (let x = 64; x < size; x += 96) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,size); ctx.stroke(); }
  }
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.25, 1.4);
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return texture;
}

function setMaterialFinish() {
  const finishes = {
    cuero: { roughness: .48, clearcoat: .22, clearcoatRoughness: .5, bumpScale: .035 },
    pranna: { roughness: .76, clearcoat: .02, clearcoatRoughness: .9, bumpScale: .08 },
    detroit: { roughness: .66, clearcoat: .06, clearcoatRoughness: .8, bumpScale: .11 },
    natural: { roughness: .38, clearcoat: .32, clearcoatRoughness: .42, bumpScale: .05 },
  }[state.material];
  [baseMaterial, accentMaterial, centerMaterial].forEach(mat => Object.assign(mat, finishes));
}

function updateSeat() {
  const applyBase = state.zone === 'all' || state.zone === 'sides';
  const applyCenter = state.zone === 'all' || state.zone === 'center';
  if (applyBase) baseMaterial.color.set(state.base);
  if (applyCenter) {
    centerMaterial.color.set(state.base);
    if (centerMaterial.map) centerMaterial.map.dispose();
    centerMaterial.map = textureFor(state.design, state.base, state.stitch);
  }
  accentMaterial.color.set(state.accent);
  stitchMaterial.color.set(state.stitch);
  setMaterialFinish();
  [baseMaterial, accentMaterial, centerMaterial, stitchMaterial].forEach(mat => mat.needsUpdate = true);
  updateSummary();
}

function updateSummary() {
  document.querySelector('#summaryName').textContent = `${state.designName} · ${state.materialName}`;
  document.querySelector('#summaryDetail').textContent = `${colorName(state.base)} + ${colorName(state.accent)} · ${state.zoneName}`;
  document.querySelector('#dialogPattern').textContent = state.designName;
  document.querySelector('#dialogMaterial').textContent = state.materialName;
  document.querySelector('#dialogColors').textContent = `${colorName(state.base)} + ${colorName(state.accent)}`;
}

function colorName(hex) {
  return ({ '#24272c': 'Negro', '#d9d7d0': 'Marfil', '#5a331f': 'Cacao', '#243247': 'Azul noche', '#ee2737': 'Rojo', '#ef3340': 'Rojo', '#c9974f': 'Caramelo', '#777b80': 'Grafito', '#16735e': 'Verde', '#f4f0e8': 'Blanco', '#d5a84f': 'Dorado', '#202124': 'Negro' })[hex] || 'Personalizado';
}

function resetView() {
  camera.position.set(5.4, 3.45, 8.9);
  controls.target.set(0, 2.25, 0);
  controls.update();
}

document.querySelectorAll('.design-card').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.design-card').forEach(el => el.classList.remove('is-active'));
  button.classList.add('is-active');
  state.design = button.dataset.design;
  state.designName = button.querySelector('strong').textContent;
  updateSeat();
}));

document.querySelectorAll('.swatches').forEach(group => group.addEventListener('click', event => {
  const button = event.target.closest('.swatch');
  if (!button) return;
  group.querySelectorAll('.swatch').forEach(el => el.classList.remove('is-active'));
  button.classList.add('is-active');
  state[group.dataset.target] = button.dataset.color;
  updateSeat();
}));

document.querySelectorAll('.material-option').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.material-option').forEach(el => el.classList.remove('is-active'));
  button.classList.add('is-active');
  state.material = button.dataset.material;
  state.materialName = button.querySelector('strong').textContent;
  updateSeat();
}));

document.querySelectorAll('.zone').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.zone').forEach(el => el.classList.remove('is-active'));
  button.classList.add('is-active');
  state.zone = button.dataset.zone;
  state.zoneName = button.textContent.toLowerCase();
  updateSeat();
}));

document.querySelector('#spinButton').addEventListener('click', event => {
  controls.autoRotate = !controls.autoRotate;
  event.currentTarget.classList.toggle('is-active', controls.autoRotate);
  event.currentTarget.setAttribute('aria-pressed', String(controls.autoRotate));
});
document.querySelector('#viewButton').addEventListener('click', resetView);

document.querySelector('#resetButton').addEventListener('click', () => {
  Object.assign(state, { design: 'rombo', designName: 'Rombo Andino', base: '#d9d7d0', accent: '#777b80', stitch: '#f4f0e8', material: 'cuero', materialName: 'Tacto cuero', zone: 'all', zoneName: 'asiento completo' });
  document.querySelectorAll('.design-card').forEach((el, i) => el.classList.toggle('is-active', i === 0));
  document.querySelectorAll('.swatches').forEach(group => group.querySelectorAll('.swatch').forEach((el, i) => el.classList.toggle('is-active', i === 0)));
  document.querySelectorAll('.material-option').forEach((el, i) => el.classList.toggle('is-active', i === 0));
  document.querySelectorAll('.zone').forEach((el, i) => el.classList.toggle('is-active', i === 0));
  updateSeat(); resetView();
});

const dialog = document.querySelector('#quoteDialog');
document.querySelector('#quoteButton').addEventListener('click', () => dialog.showModal());
document.querySelector('#quoteForm').addEventListener('submit', event => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  const model = document.querySelector('#vehicleModel').value.trim();
  const year = document.querySelector('#vehicleYear').value.trim();
  const message = `Hola Tapiz Juliaca, quiero cotizar este diseño:\n\nVehículo: ${model} ${year}\nDiseño: ${state.designName}\nMaterial: ${state.materialName}\nColores: ${colorName(state.base)} + ${colorName(state.accent)}\nCostura: ${colorName(state.stitch)}\nAplicación: ${state.zoneName}\n\n¿Podrían confirmarme disponibilidad y precio?`;
  window.open(`https://wa.me/51931039672?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  dialog.close();
});

function resize() {
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return;
  const width = Math.round(rect.width * Math.min(window.devicePixelRatio, 2));
  const height = Math.round(rect.height * Math.min(window.devicePixelRatio, 2));
  if (canvas.width !== width || canvas.height !== height) {
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  }
}

function animate() {
  requestAnimationFrame(animate);
  resize();
  controls.update();
  renderer.render(scene, camera);
}

updateSeat();
animate();

window.addEventListener('load', async () => {
  const context = document.modelContext || navigator.modelContext;
  if (!context) return;
  const controller = new AbortController();
  const designs = { rombo: 'Rombo Andino', titicaca: 'Titicaca', mantaro: 'Mantaro', original: 'Original' };
  const materials = { cuero: 'Tacto cuero', pranna: 'Pranna', detroit: 'Detroit', natural: 'Cuero natural' };
  await context.registerTool({
    name: 'configurar_tapizado',
    description: 'Cambia el diseño, material y colores del asiento 3D de Tapiz Juliaca.',
    inputSchema: {
      type: 'object',
      properties: {
        design: { type: 'string', enum: Object.keys(designs), description: 'Diseño del panel central.' },
        material: { type: 'string', enum: Object.keys(materials), description: 'Acabado del tapiz.' },
        base: { type: 'string', enum: ['#24272c', '#d9d7d0', '#5a331f', '#243247'], description: 'Color principal hexadecimal.' },
        accent: { type: 'string', enum: ['#ee2737', '#c9974f', '#777b80', '#16735e'], description: 'Color de contraste hexadecimal.' },
      },
      additionalProperties: false,
    },
    execute: async ({ design, material, base, accent }) => {
      if (design) { state.design = design; state.designName = designs[design]; document.querySelector(`.design-card[data-design="${design}"]`)?.click(); }
      if (material) { state.material = material; state.materialName = materials[material]; document.querySelector(`.material-option[data-material="${material}"]`)?.click(); }
      if (base) state.base = base;
      if (accent) state.accent = accent;
      updateSeat();
      return { design: state.designName, material: state.materialName, base: colorName(state.base), accent: colorName(state.accent) };
    },
  }, { signal: controller.signal });
  await context.registerTool({
    name: 'ver_configuracion_tapizado',
    description: 'Devuelve la configuración actual del asiento 3D sin modificarla.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
    execute: async () => ({ design: state.designName, material: state.materialName, base: colorName(state.base), accent: colorName(state.accent), stitch: colorName(state.stitch), zone: state.zoneName }),
  }, { signal: controller.signal });
});
