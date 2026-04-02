import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import {
  SCENE_PLANETS,
  PLANET_SPACING,
  TEXTURE_URLS,
  BUMP_URLS,
  toSceneIndex,
  type Planet,
} from '../data/planets';
import { createAtmosphereMaterial } from '../shaders/atmosphere';
import { generateNoiseTexture } from '../utils/textures';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PlanetSceneProps {
  activeIndex: number;
  onPlanetChange: (index: number) => void;
}

interface SceneRefs {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  cameraRig: THREE.Group;
  renderer: THREE.WebGLRenderer;
  rimLight: THREE.DirectionalLight;
  planets: THREE.Mesh[];
  atmospheres: THREE.Mesh[];
  lookAtTarget: THREE.Vector3;
}

// ---------------------------------------------------------------------------
// Scene builders (pure functions that return Three.js objects)
// ---------------------------------------------------------------------------

function createRenderer(container: HTMLElement): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);
  return renderer;
}

function createCameraRig(
  scene: THREE.Scene,
  planet: Planet,
  sceneIndex: number,
): { cameraRig: THREE.Group; camera: THREE.PerspectiveCamera; lookAtTarget: THREE.Vector3 } {
  const cameraRig = new THREE.Group();
  scene.add(cameraRig);

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    3000,
  );
  cameraRig.add(camera);

  const targetZ = -sceneIndex * PLANET_SPACING;
  const lookAtZ = -(sceneIndex + 1) * PLANET_SPACING;
  const camY = planet.radius * 1.6;
  const camZRelative = planet.radius * 1.7;

  cameraRig.position.set(0, 0, targetZ);
  camera.position.set(0, camY, camZRelative);

  const lookAtTarget = new THREE.Vector3(0, -planet.radius * 2.2, lookAtZ);
  camera.lookAt(lookAtTarget);

  return { cameraRig, camera, lookAtTarget };
}

function createLighting(
  cameraRig: THREE.Group,
  scene: THREE.Scene,
  initialColor: string,
): { rimLight: THREE.DirectionalLight } {
  const ambient = new THREE.AmbientLight(0xffffff, 0.02);
  scene.add(ambient);

  const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
  sunLight.position.set(0, 50, 100);
  sunLight.castShadow = true;
  Object.assign(sunLight.shadow, {
    mapSize: new THREE.Vector2(2048, 2048),
    bias: -0.001,
  });
  Object.assign(sunLight.shadow.camera, {
    near: 0.5,
    far: 1000,
    left: -100,
    right: 100,
    top: 100,
    bottom: -100,
  });
  cameraRig.add(sunLight);
  cameraRig.add(sunLight.target);
  sunLight.target.position.set(0, 0, 0);

  const rimLight = new THREE.DirectionalLight(initialColor, 6);
  rimLight.position.set(0, 50, -100);
  cameraRig.add(rimLight);
  cameraRig.add(rimLight.target);
  rimLight.target.position.set(0, 0, 0);

  return { rimLight };
}

function createPlanetMesh(
  planet: Planet,
  zPos: number,
  loader: THREE.TextureLoader,
): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(planet.radius, 128, 128);

  const hasTexture = Boolean(TEXTURE_URLS[planet.id]);
  const texture = hasTexture
    ? loader.load(TEXTURE_URLS[planet.id])
    : generateNoiseTexture(planet.color);

  if (hasTexture && texture instanceof THREE.Texture) {
    texture.colorSpace = THREE.SRGBColorSpace;
  }

  const bumpTexture = BUMP_URLS[planet.id]
    ? loader.load(BUMP_URLS[planet.id])
    : undefined;

  const skipBump = ['uranus', 'neptune'].includes(planet.id);

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    color: hasTexture ? 0xffffff : planet.color,
    roughness: 0.8,
    metalness: 0.1,
    bumpMap: bumpTexture ?? (skipBump ? null : texture),
    bumpScale: bumpTexture ? (planet.id === 'mercury' ? 0.5 : 2.0) : 0.5,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set(0, 0, zPos);
  mesh.rotation.y = Math.random() * Math.PI;
  mesh.rotation.z = Math.random() * 0.2;

  return mesh;
}

function createAtmosphereMesh(planet: Planet, zPos: number): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(planet.radius * 1.15, 64, 64);
  const material = createAtmosphereMaterial(planet.color);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 0, zPos);
  return mesh;
}

function populateScene(scene: THREE.Scene): { planets: THREE.Mesh[]; atmospheres: THREE.Mesh[] } {
  const loader = new THREE.TextureLoader();
  const planets: THREE.Mesh[] = [];
  const atmospheres: THREE.Mesh[] = [];

  SCENE_PLANETS.forEach((planet, i) => {
    const zPos = -i * PLANET_SPACING;

    const planetMesh = createPlanetMesh(planet, zPos, loader);
    scene.add(planetMesh);
    planets.push(planetMesh);

    const atmosMesh = createAtmosphereMesh(planet, zPos);
    scene.add(atmosMesh);
    atmospheres.push(atmosMesh);
  });

  return { planets, atmospheres };
}

// ---------------------------------------------------------------------------
// Interaction helpers
// ---------------------------------------------------------------------------

const CLICK_THRESHOLD = 5;

function setupMouseInteraction(
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  planets: THREE.Mesh[],
  activeIndexRef: React.MutableRefObject<number>,
  onPlanetChange: (index: number) => void,
) {
  let isDragging = false;
  let prevMouse = { x: 0, y: 0 };
  let clickStart = { x: 0, y: 0 };
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  const onMouseDown = (e: MouseEvent) => {
    isDragging = true;
    prevMouse = { x: e.clientX, y: e.clientY };
    clickStart = { x: e.clientX, y: e.clientY };
  };

  const onMouseUp = (e: MouseEvent) => {
    isDragging = false;

    const dx = Math.abs(e.clientX - clickStart.x);
    const dy = Math.abs(e.clientY - clickStart.y);
    if (dx >= CLICK_THRESHOLD || dy >= CLICK_THRESHOLD) return;

    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    const hits = raycaster.intersectObjects(planets);
    if (hits.length === 0) return;

    const idx = planets.indexOf(hits[0].object as THREE.Mesh);
    if (idx !== -1) {
      onPlanetChange(SCENE_PLANETS.length - 1 - idx);
    }
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - prevMouse.x;
    const dy = e.clientY - prevMouse.y;

    const activeMesh = planets[toSceneIndex(activeIndexRef.current)];
    if (activeMesh) {
      activeMesh.rotation.y += dx * 0.005;
      activeMesh.rotation.x += dy * 0.005;
    }
    prevMouse = { x: e.clientX, y: e.clientY };
  };

  renderer.domElement.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('mousemove', onMouseMove);

  return {
    isDraggingRef: () => isDragging,
    cleanup() {
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
    },
  };
}

// ---------------------------------------------------------------------------
// Transition animation
// ---------------------------------------------------------------------------

function animateTransition(refs: SceneRefs, activeIndex: number) {
  gsap.killTweensOf(refs.camera.position);
  gsap.killTweensOf(refs.cameraRig.position);
  gsap.killTweensOf(refs.lookAtTarget);

  const sceneIndex = toSceneIndex(activeIndex);
  const planet = SCENE_PLANETS[sceneIndex];
  const targetZ = -sceneIndex * PLANET_SPACING;
  const lookAtZ = -(sceneIndex + 1) * PLANET_SPACING;

  const duration = 2.5;
  const ease = 'power3.inOut';

  gsap.to(refs.cameraRig.position, { z: targetZ, duration, ease });
  gsap.to(refs.camera.position, {
    x: 0,
    y: planet.radius * 1.6,
    z: planet.radius * 1.7,
    duration,
    ease,
  });
  gsap.to(refs.lookAtTarget, {
    x: 0,
    y: -planet.radius * 2.2,
    z: lookAtZ,
    duration,
    ease,
  });

  const targetColor = new THREE.Color(planet.color);
  gsap.to(refs.rimLight.color, {
    r: targetColor.r,
    g: targetColor.g,
    b: targetColor.b,
    duration,
    ease,
  });
}

// ---------------------------------------------------------------------------
// Disposal
// ---------------------------------------------------------------------------

function disposeScene(refs: SceneRefs, container: HTMLElement) {
  if (container && refs.renderer.domElement.parentNode === container) {
    container.removeChild(refs.renderer.domElement);
  }
  refs.renderer.dispose();

  [...refs.planets, ...refs.atmospheres].forEach((mesh) => {
    mesh.geometry.dispose();
    (mesh.material as THREE.Material).dispose();
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PlanetScene({ activeIndex, onPlanetChange }: PlanetSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const refsRef = useRef<SceneRefs | null>(null);
  const activeIndexRef = useRef(activeIndex);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // --- One-time scene initialisation ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#000000');
    scene.fog = new THREE.Fog('#000000', 300, 800);

    const initialSceneIndex = toSceneIndex(activeIndex);
    const initialPlanet = SCENE_PLANETS[initialSceneIndex];

    const { cameraRig, camera, lookAtTarget } = createCameraRig(
      scene,
      initialPlanet,
      initialSceneIndex,
    );
    const renderer = createRenderer(container);
    const { rimLight } = createLighting(cameraRig, scene, initialPlanet.color);
    const { planets, atmospheres } = populateScene(scene);

    const refs: SceneRefs = {
      scene,
      camera,
      cameraRig,
      renderer,
      rimLight,
      planets,
      atmospheres,
      lookAtTarget,
    };
    refsRef.current = refs;

    const { isDraggingRef, cleanup: cleanupMouse } = setupMouseInteraction(
      renderer,
      camera,
      planets,
      activeIndexRef,
      onPlanetChange,
    );

    // --- Animation loop ---
    let frameId: number;
    const tick = () => {
      const activeSceneIdx = toSceneIndex(activeIndexRef.current);
      planets.forEach((p, i) => {
        if (!isDraggingRef() || i !== activeSceneIdx) {
          p.rotation.y += 0.002;
        }
      });
      camera.lookAt(lookAtTarget);
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    };
    tick();

    // --- Resize ---
    const handleResize = () => {
      const { clientWidth: w, clientHeight: h } = container;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      cleanupMouse();
      cancelAnimationFrame(frameId);
      disposeScene(refs, container);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Planet transition animation ---
  useEffect(() => {
    if (refsRef.current) {
      animateTransition(refsRef.current, activeIndex);
    }
  }, [activeIndex]);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full z-0" />;
}
