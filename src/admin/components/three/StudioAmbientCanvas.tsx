import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface StudioAmbientCanvasProps {
  onUnavailable?: () => void;
}

function isSoftwareGl(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererStr = dbg
      ? (gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) as string | null) || ''
      : '';
    const software = /swiftshader|llvmpipe|software rasterizer|mesa offscreen/i.test(
      rendererStr
    );
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return software;
  } catch {
    return true;
  }
}

const StudioAmbientCanvas: React.FC<StudioAmbientCanvasProps> = ({
  onUnavailable,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (isSoftwareGl()) {
      onUnavailable?.();
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      onUnavailable?.();
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth || 280, container.clientHeight || 220);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const width = container.clientWidth || 280;
    const height = container.clientHeight || 220;
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 40);
    camera.position.set(0, 0.35, 6.2);

    // Environment reflections for brushed muted gold metal
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = 0.72;
    roomEnv.dispose();

    // Studio key / rim lighting
    const keyLight = new THREE.DirectionalLight('#E8E5DF', 1.45);
    keyLight.position.set(4, 5, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#C9A96E', 2.2);
    rimLight.position.set(-5, -2, -4);
    scene.add(rimLight);

    // Composite kinetic studio sculpture
    const sculpture = new THREE.Group();
    scene.add(sculpture);

    const accentMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#C9A96E'),
      emissive: new THREE.Color('#5C4524'),
      emissiveIntensity: 0.28,
      metalness: 0.88,
      roughness: 0.22,
      clearcoat: 0.45,
      clearcoatRoughness: 0.25,
    });

    const obsidianMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#141419'),
      metalness: 0.45,
      roughness: 0.4,
      clearcoat: 0.2,
    });

    const wireMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#DFC492'),
      wireframe: true,
      transparent: true,
      opacity: 0.24,
    });

    // Inner obsidian core monolith
    const coreGeo = new THREE.OctahedronGeometry(0.95, 0);
    const coreMesh = new THREE.Mesh(coreGeo, obsidianMaterial);
    sculpture.add(coreMesh);

    // Architectural wireframe cage
    const cageGeo = new THREE.IcosahedronGeometry(1.18, 0);
    const cageMesh = new THREE.Mesh(cageGeo, wireMaterial);
    sculpture.add(cageMesh);

    // Machined gold orbital rings
    const outerRingGeo = new THREE.TorusGeometry(1.75, 0.032, 20, 96);
    const outerRing = new THREE.Mesh(outerRingGeo, accentMaterial);
    outerRing.rotation.x = Math.PI * 0.34;
    outerRing.rotation.y = Math.PI * 0.18;
    sculpture.add(outerRing);

    const innerRingGeo = new THREE.TorusGeometry(1.42, 0.022, 16, 84);
    const innerRing = new THREE.Mesh(innerRingGeo, accentMaterial);
    innerRing.rotation.x = -Math.PI * 0.28;
    innerRing.rotation.z = Math.PI * 0.25;
    sculpture.add(innerRing);

    // Precision accent spheres mounted on outer ring
    const nodeGeo = new THREE.SphereGeometry(0.065, 16, 16);
    const nodeA = new THREE.Mesh(nodeGeo, accentMaterial);
    nodeA.position.set(1.75, 0, 0);
    outerRing.add(nodeA);

    const nodeB = new THREE.Mesh(nodeGeo, accentMaterial);
    nodeB.position.set(-1.75, 0, 0);
    outerRing.add(nodeB);

    // Subtle ambient floating gold dust points
    const particleCount = 36;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 2.0 + (i % 5) * 0.22;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = ((i % 7) - 3) * 0.36;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    const particlesGeo = new THREE.BufferGeometry();
    particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMat = new THREE.PointsMaterial({
      color: '#DFC492',
      size: 0.035,
      transparent: true,
      opacity: 0.48,
    });
    const particles = new THREE.Points(particlesGeo, particlesMat);
    sculpture.add(particles);

    let pointerX = 0;
    let pointerY = 0;
    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointerX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      pointerY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    container.addEventListener('pointermove', handlePointerMove, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      const nextW = container.clientWidth || 280;
      const nextH = container.clientHeight || 220;
      camera.aspect = nextW / nextH;
      camera.updateProjectionMatrix();
      renderer.setSize(nextW, nextH);
    });
    resizeObserver.observe(container);

    let frameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = window.requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      coreMesh.rotation.y = elapsed * 0.26;
      coreMesh.rotation.x = Math.sin(elapsed * 0.35) * 0.16;

      cageMesh.rotation.y = -elapsed * 0.16;
      cageMesh.rotation.z = elapsed * 0.08;

      outerRing.rotation.z = elapsed * 0.22;
      innerRing.rotation.y = -elapsed * 0.28;
      particles.rotation.y = elapsed * 0.06;

      // Subtle pointer parallax
      sculpture.rotation.y += (pointerX * 0.25 - sculpture.rotation.y) * 0.05;
      sculpture.rotation.x += (-pointerY * 0.18 - sculpture.rotation.x) * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      container.removeEventListener('pointermove', handlePointerMove);

      coreGeo.dispose();
      cageGeo.dispose();
      outerRingGeo.dispose();
      innerRingGeo.dispose();
      nodeGeo.dispose();
      particlesGeo.dispose();
      accentMaterial.dispose();
      obsidianMaterial.dispose();
      wireMaterial.dispose();
      particlesMat.dispose();
      envTarget.dispose();
      pmremGenerator.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onUnavailable]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[210px] select-none"
      aria-hidden="true"
    />
  );
};

export default StudioAmbientCanvas;
