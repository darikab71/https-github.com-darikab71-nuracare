import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import * as THREE from 'three';

interface ThreeAvatarCanvasProps {
  character: 'nura' | 'nuri';
  onTap?: () => void;
  isSquashing?: boolean;
}

export default function ThreeAvatarCanvas({
  character,
  onTap,
  isSquashing = false,
}: ThreeAvatarCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const characterGroupRef = useRef<THREE.Group | null>(null);
  const headGroupRef = useRef<THREE.Group | null>(null);
  const eyesGroupRef = useRef<THREE.Group | null>(null);
  const leftEyelidRef = useRef<THREE.Mesh | null>(null);
  const rightEyelidRef = useRef<THREE.Mesh | null>(null);
  const leftPupilRef = useRef<THREE.Mesh | null>(null);
  const rightPupilRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const animFrameId = useRef<number | null>(null);
  const clockRef = useRef(new THREE.Clock());

  // Blink timing
  const nextBlinkTime = useRef(2.0);
  const isBlinking = useRef(false);
  const blinkProgress = useRef(0);

  // Tap reaction animation state
  const tapAnimTime = useRef(-1);

  useEffect(() => {
    if (Platform.OS !== 'web' || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 340;
    const height = container.clientHeight || 180;

    // 1. SCENE
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. CAMERA
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 3.6);
    cameraRef.current = camera;

    // 3. RENDERER
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. LIGHTING (Soft cartoon studio setup)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff5ea, 1.1);
    keyLight.position.set(2, 3, 3);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd4f4e2, 0.6); // Soft sage fill
    fillLight.position.set(-2.5, 1, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x4ade80, 0.8); // Mint rim accent
    rimLight.position.set(0, -2, -2);
    scene.add(rimLight);

    // 5. BUILD 3D CARTOON CHARACTER
    const charGroup = new THREE.Group();
    characterGroupRef.current = charGroup;
    scene.add(charGroup);

    buildCharacter(charGroup, character);

    // 6. FLOATING PARTICLES (Subtle wellness motes)
    const particleCount = 28;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 4;
      particlePositions[i + 1] = (Math.random() - 0.5) * 2.5;
      particlePositions[i + 2] = (Math.random() - 0.5) * 2;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x86efac,
      size: 0.05,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    particlesRef.current = particles;
    scene.add(particles);

    // 7. MOUSE / TOUCH INTERACTION LISTENERS
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mousePos.current.targetX = Math.max(-1, Math.min(1, x));
      mousePos.current.targetY = Math.max(-1, Math.min(1, y));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((touch.clientY - rect.top) / rect.height) * 2 - 1);
        mousePos.current.targetX = Math.max(-1, Math.min(1, x));
        mousePos.current.targetY = Math.max(-1, Math.min(1, y));
      }
    };

    const handlePointerLeave = () => {
      mousePos.current.targetX = 0;
      mousePos.current.targetY = 0;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('mouseleave', handlePointerLeave);

    // 8. RESIZE OBSERVER
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = w / h;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // 9. ANIMATION LOOP
    clockRef.current.start();
    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);

      const elapsedTime = clockRef.current.getElapsedTime();
      const delta = clockRef.current.getDelta();

      // Smooth mouse follow with damping
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.08;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.08;

      // Idle cartoon breathing (12 bpm = 0.2 Hz)
      const breathPhase = elapsedTime * 2.8;
      const breathScaleY = 1 + Math.sin(breathPhase) * 0.025;
      const breathScaleX = 1 - Math.sin(breathPhase) * 0.012;
      const breathTranslateY = Math.sin(breathPhase) * 0.035;

      // Subtle float wave
      const floatY = Math.sin(elapsedTime * 1.6) * 0.02;

      // Head look-at mouse tracking
      if (headGroupRef.current) {
        headGroupRef.current.rotation.y = mousePos.current.x * 0.35;
        headGroupRef.current.rotation.x = -mousePos.current.y * 0.22 + Math.sin(breathPhase) * 0.03;
        headGroupRef.current.rotation.z = -mousePos.current.x * 0.08;
      }

      // Eye pupil micro-tracking
      if (leftPupilRef.current && rightPupilRef.current) {
        const pupilX = mousePos.current.x * 0.035;
        const pupilY = mousePos.current.y * 0.025;
        leftPupilRef.current.position.x = -0.16 + pupilX;
        leftPupilRef.current.position.y = 0.06 + pupilY;
        rightPupilRef.current.position.x = 0.16 + pupilX;
        rightPupilRef.current.position.y = 0.06 + pupilY;
      }

      // Blinking animation
      if (elapsedTime > nextBlinkTime.current) {
        isBlinking.current = true;
        blinkProgress.current = 0;
        nextBlinkTime.current = elapsedTime + 3.0 + Math.random() * 3.5;
      }

      if (isBlinking.current) {
        blinkProgress.current += delta * 12; // Quick 150ms blink
        const blinkScale = Math.sin(blinkProgress.current * Math.PI);
        if (leftEyelidRef.current && rightEyelidRef.current) {
          leftEyelidRef.current.scale.y = Math.max(0.01, blinkScale);
          rightEyelidRef.current.scale.y = Math.max(0.01, blinkScale);
        }
        if (blinkProgress.current >= 1) {
          isBlinking.current = false;
          if (leftEyelidRef.current && rightEyelidRef.current) {
            leftEyelidRef.current.scale.y = 0.01;
            rightEyelidRef.current.scale.y = 0.01;
          }
        }
      }

      // Tap squash & stretch reaction
      let tapScaleY = 1;
      let tapScaleX = 1;
      let tapOffsetY = 0;
      if (tapAnimTime.current > 0) {
        const t = elapsedTime - tapAnimTime.current;
        if (t < 0.6) {
          if (t < 0.1) {
            const p = t / 0.1;
            tapScaleY = 1 - p * 0.22;
            tapScaleX = 1 + p * 0.20;
            tapOffsetY = -p * 0.12;
          } else if (t < 0.28) {
            const p = (t - 0.1) / 0.18;
            tapScaleY = 0.78 + p * 0.44;
            tapScaleX = 1.20 - p * 0.35;
            tapOffsetY = -0.12 + p * 0.32;
          } else {
            const p = (t - 0.28) / 0.32;
            const decay = Math.exp(-p * 5);
            tapScaleY = 1 + Math.sin(p * Math.PI * 4) * 0.14 * decay;
            tapScaleX = 1 - Math.sin(p * Math.PI * 4) * 0.10 * decay;
            tapOffsetY = Math.sin(p * Math.PI * 3) * 0.08 * decay;
          }
        } else {
          tapAnimTime.current = -1;
        }
      }

      // Apply combined cartoon kinematics
      if (charGroup) {
        charGroup.scale.y = breathScaleY * tapScaleY;
        charGroup.scale.x = breathScaleX * tapScaleX;
        charGroup.scale.z = breathScaleX * tapScaleX;
        charGroup.position.y = -0.28 + breathTranslateY + floatY + tapOffsetY;
      }

      // Rotate particle cloud gently
      if (particlesRef.current) {
        particlesRef.current.rotation.y = elapsedTime * 0.05;
        particlesRef.current.rotation.x = Math.sin(elapsedTime * 0.1) * 0.05;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('mouseleave', handlePointerLeave);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [character]);

  const handleTriggerTap = () => {
    tapAnimTime.current = clockRef.current.getElapsedTime();
    if (onTap) onTap();
  };

  /**
   * Procedural Rigged Cartoon Character Builder (NURA & NURI)
   * High aesthetic fidelity to NuraCare classic cartoon character design
   */
  const buildCharacter = (group: THREE.Group, char: 'nura' | 'nuri') => {
    const skinColor = 0xe8b896;
    const glassesColor = 0x1e293b;
    const nuraBlazerColor = 0x1e5646;
    const nuraCollarColor = 0xffffff;
    const nuriHoodieColor = 0x22c55e;
    const darkHairColor = 0x241711;

    const skinMat = new THREE.MeshToonMaterial({ color: skinColor });
    const hairMat = new THREE.MeshToonMaterial({ color: darkHairColor });
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x1f1917 });
    const highlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const glassesMat = new THREE.MeshToonMaterial({ color: glassesColor });
    const glassesLensMat = new THREE.MeshPhysicalMaterial({
      color: 0xecfdf5,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      transmission: 0.8,
    });
    const lipsMat = new THREE.MeshToonMaterial({ color: 0xd97768 });
    const blushMat = new THREE.MeshBasicMaterial({
      color: 0xf472b6,
      transparent: true,
      opacity: 0.28,
    });

    // 1. TORSO & CLOTHING
    const torsoGroup = new THREE.Group();
    group.add(torsoGroup);

    if (char === 'nura') {
      const blazerGeo = new THREE.CylinderGeometry(0.48, 0.58, 0.72, 24);
      const blazerMat = new THREE.MeshToonMaterial({ color: nuraBlazerColor });
      const blazer = new THREE.Mesh(blazerGeo, blazerMat);
      blazer.position.y = -0.36;
      torsoGroup.add(blazer);

      const shirtGeo = new THREE.ConeGeometry(0.18, 0.36, 16);
      const shirtMat = new THREE.MeshToonMaterial({ color: nuraCollarColor });
      const shirt = new THREE.Mesh(shirtGeo, shirtMat);
      shirt.rotation.z = Math.PI;
      shirt.position.set(0, -0.15, 0.44);
      torsoGroup.add(shirt);

      const pinGeo = new THREE.SphereGeometry(0.045, 12, 12);
      const pinMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.8,
        roughness: 0.3,
      });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.set(-0.25, -0.25, 0.46);
      torsoGroup.add(pin);
    } else {
      const hoodieGeo = new THREE.CylinderGeometry(0.52, 0.62, 0.74, 24);
      const hoodieMat = new THREE.MeshToonMaterial({ color: nuriHoodieColor });
      const hoodie = new THREE.Mesh(hoodieGeo, hoodieMat);
      hoodie.position.y = -0.36;
      torsoGroup.add(hoodie);

      const cowlGeo = new THREE.TorusGeometry(0.32, 0.09, 12, 24);
      const cowl = new THREE.Mesh(cowlGeo, hoodieMat);
      cowl.rotation.x = Math.PI / 2.3;
      cowl.position.set(0, -0.05, 0.12);
      torsoGroup.add(cowl);

      const emblemGeo = new THREE.CircleGeometry(0.09, 16);
      const emblemMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const emblem = new THREE.Mesh(emblemGeo, emblemMat);
      emblem.position.set(0, -0.28, 0.54);
      torsoGroup.add(emblem);
    }

    // 2. NECK
    const neckGeo = new THREE.CylinderGeometry(0.16, 0.18, 0.28, 16);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = 0.05;
    torsoGroup.add(neck);

    // 3. HEAD GROUP
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.32, 0);
    headGroupRef.current = headGroup;
    group.add(headGroup);

    const headGeo = new THREE.SphereGeometry(0.52, 32, 32);
    headGeo.scale(1.0, 1.12, 0.96);
    const head = new THREE.Mesh(headGeo, skinMat);
    headGroup.add(head);

    const blushGeo = new THREE.CircleGeometry(0.11, 16);
    const leftBlush = new THREE.Mesh(blushGeo, blushMat);
    leftBlush.position.set(-0.32, -0.05, 0.44);
    leftBlush.rotation.y = -0.38;
    headGroup.add(leftBlush);

    const rightBlush = new THREE.Mesh(blushGeo, blushMat);
    rightBlush.position.set(0.32, -0.05, 0.44);
    rightBlush.rotation.y = 0.38;
    headGroup.add(rightBlush);

    const noseGeo = new THREE.SphereGeometry(0.065, 16, 16);
    const nose = new THREE.Mesh(noseGeo, skinMat);
    nose.position.set(0, 0.01, 0.52);
    headGroup.add(nose);

    const smileCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.14, -0.16, 0.46),
      new THREE.Vector3(0, -0.24, 0.48),
      new THREE.Vector3(0.14, -0.16, 0.46)
    );
    const smileGeo = new THREE.TubeGeometry(smileCurve, 16, 0.022, 8, false);
    const mouth = new THREE.Mesh(smileGeo, lipsMat);
    headGroup.add(mouth);

    // 4. EYES & PUPILS
    const eyesGroup = new THREE.Group();
    eyesGroupRef.current = eyesGroup;
    headGroup.add(eyesGroup);

    const eyeGeo = new THREE.SphereGeometry(0.13, 24, 24);
    eyeGeo.scale(1, 1.15, 0.6);

    const leftEye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    leftEye.position.set(-0.17, 0.08, 0.43);
    eyesGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    rightEye.position.set(0.17, 0.08, 0.43);
    eyesGroup.add(rightEye);

    const pupilGeo = new THREE.SphereGeometry(0.065, 16, 16);
    pupilGeo.scale(1, 1.1, 0.3);

    const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
    leftPupil.position.set(-0.16, 0.06, 0.49);
    leftPupilRef.current = leftPupil;
    eyesGroup.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
    rightPupil.position.set(0.16, 0.06, 0.49);
    rightPupilRef.current = rightPupil;
    eyesGroup.add(rightPupil);

    const sparkGeo = new THREE.SphereGeometry(0.022, 12, 12);
    const leftSpark = new THREE.Mesh(sparkGeo, highlightMat);
    leftSpark.position.set(-0.14, 0.09, 0.51);
    eyesGroup.add(leftSpark);

    const rightSpark = new THREE.Mesh(sparkGeo, highlightMat);
    rightSpark.position.set(0.18, 0.09, 0.51);
    eyesGroup.add(rightSpark);

    const eyelidGeo = new THREE.SphereGeometry(0.136, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2);
    eyelidGeo.scale(1.02, 1.2, 0.7);

    const leftEyelid = new THREE.Mesh(eyelidGeo, skinMat);
    leftEyelid.position.set(-0.17, 0.12, 0.44);
    leftEyelid.scale.y = 0.01;
    leftEyelidRef.current = leftEyelid;
    eyesGroup.add(leftEyelid);

    const rightEyelid = new THREE.Mesh(eyelidGeo, skinMat);
    rightEyelid.position.set(0.17, 0.12, 0.44);
    rightEyelid.scale.y = 0.01;
    rightEyelidRef.current = rightEyelid;
    eyesGroup.add(rightEyelid);

    // 5. SIGNATURE GLASSES
    const glassesGroup = new THREE.Group();
    headGroup.add(glassesGroup);

    const rimGeo = new THREE.TorusGeometry(0.155, 0.018, 12, 32);
    const leftRim = new THREE.Mesh(rimGeo, glassesMat);
    leftRim.position.set(-0.17, 0.08, 0.52);
    glassesGroup.add(leftRim);

    const rightRim = new THREE.Mesh(rimGeo, glassesMat);
    rightRim.position.set(0.17, 0.08, 0.52);
    glassesGroup.add(rightRim);

    const bridgeCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.06, 0.1, 0.53),
      new THREE.Vector3(0, 0.13, 0.54),
      new THREE.Vector3(0.06, 0.1, 0.53)
    );
    const bridgeGeo = new THREE.TubeGeometry(bridgeCurve, 10, 0.014, 8, false);
    const bridge = new THREE.Mesh(bridgeGeo, glassesMat);
    glassesGroup.add(bridge);

    const lensGeo = new THREE.CircleGeometry(0.145, 24);
    const leftLens = new THREE.Mesh(lensGeo, glassesLensMat);
    leftLens.position.set(-0.17, 0.08, 0.52);
    glassesGroup.add(leftLens);

    const rightLens = new THREE.Mesh(lensGeo, glassesLensMat);
    rightLens.position.set(0.17, 0.08, 0.52);
    glassesGroup.add(rightLens);

    // 6. CHARACTER-SPECIFIC HAIR & ACCESSORIES
    if (char === 'nura') {
      const hairCapGeo = new THREE.SphereGeometry(0.55, 24, 24, 0, Math.PI * 2, 0, Math.PI / 1.7);
      const hairCap = new THREE.Mesh(hairCapGeo, hairMat);
      hairCap.position.set(0, 0.04, -0.04);
      headGroup.add(hairCap);

      const bunGeo = new THREE.SphereGeometry(0.24, 20, 20);
      bunGeo.scale(1.15, 0.9, 1.15);
      const bun = new THREE.Mesh(bunGeo, hairMat);
      bun.position.set(0, 0.64, -0.06);
      headGroup.add(bun);

      const tieGeo = new THREE.TorusGeometry(0.16, 0.035, 10, 24);
      const tieMat = new THREE.MeshToonMaterial({ color: 0x15803d });
      const tie = new THREE.Mesh(tieGeo, tieMat);
      tie.rotation.x = Math.PI / 2;
      tie.position.set(0, 0.54, -0.06);
      headGroup.add(tie);

      const bangGeo = new THREE.SphereGeometry(0.18, 16, 16);
      bangGeo.scale(1.8, 0.6, 0.5);
      const bang = new THREE.Mesh(bangGeo, hairMat);
      bang.position.set(-0.06, 0.42, 0.38);
      bang.rotation.z = -0.15;
      headGroup.add(bang);

      const hoopGeo = new THREE.TorusGeometry(0.085, 0.016, 10, 24);
      const hoopMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.9,
        roughness: 0.2,
      });

      const leftHoop = new THREE.Mesh(hoopGeo, hoopMat);
      leftHoop.position.set(-0.52, 0.02, 0.02);
      leftHoop.rotation.y = Math.PI / 2;
      headGroup.add(leftHoop);

      const rightHoop = new THREE.Mesh(hoopGeo, hoopMat);
      rightHoop.position.set(0.52, 0.02, 0.02);
      rightHoop.rotation.y = Math.PI / 2;
      headGroup.add(rightHoop);
    } else {
      const curlyClusters = [
        { x: 0, y: 0.52, z: 0.06, s: 0.26 },
        { x: -0.22, y: 0.48, z: 0.16, s: 0.22 },
        { x: 0.22, y: 0.48, z: 0.16, s: 0.22 },
        { x: -0.34, y: 0.36, z: 0.12, s: 0.20 },
        { x: 0.34, y: 0.36, z: 0.12, s: 0.20 },
        { x: -0.12, y: 0.44, z: 0.36, s: 0.18 },
        { x: 0.14, y: 0.42, z: 0.38, s: 0.17 },
        { x: 0, y: 0.38, z: -0.24, s: 0.28 },
        { x: -0.26, y: 0.26, z: -0.20, s: 0.22 },
        { x: 0.26, y: 0.26, z: -0.20, s: 0.22 },
      ];

      curlyClusters.forEach((c) => {
        const curlGeo = new THREE.SphereGeometry(c.s, 16, 16);
        const curlMesh = new THREE.Mesh(curlGeo, hairMat);
        curlMesh.position.set(c.x, c.y, c.z);
        headGroup.add(curlMesh);
      });
    }
  };

  return (
    <View style={styles.canvasContainer}>
      {Platform.OS === 'web' ? (
        <div
          ref={containerRef}
          style={{
            width: '100%',
            height: '100%',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onClick={handleTriggerTap}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  canvasContainer: {
    width: '100%',
    height: 185,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});
