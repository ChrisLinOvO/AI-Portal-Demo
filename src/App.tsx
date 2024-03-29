import React, { Suspense, useRef, FC, forwardRef } from 'react';
import { Canvas, useFrame, useLoader, extend } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import { Group, Mesh, TextureLoader, SphereGeometry } from 'three';
import useMovementControls from './Hooks/useMovementControls';
extend({ SphereGeometry: SphereGeometry });


type ModelProps = {
  url: string;
  [propName: string]: any;
};

// Model組件用於加載和顯示GLTF模型
const Model: FC<ModelProps> = forwardRef(({ url, ...props }, ref) => {
  const { scene } = useGLTF(url);
  console.log(scene)
  // const material = scene.children[0].material;

  // // 设置材质的颜色
  // material.color.set(0xff0000); // 这里设置为红色

  return <primitive object={scene} ref={ref} {...props} />;
});

type RotateProps = {
  children: React.ReactNode;
  [propName: string]: any;
};

// Rotate組件用於旋轉子組件
const Rotate: FC<RotateProps> = (props) => {
  const ref = useRef<Group>(null!);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime;
    }
  });
  return <group ref={ref} {...props} />;
};


// MovementHandler組件用於處理模型的移動控制
const MovementHandler: FC<{ modelRef: React.MutableRefObject<Group | null> }> = ({ modelRef }) => {
  const movement = useMovementControls();

  useFrame(() => {
    if (modelRef.current) {
      const speed = movement.speedUp ? 0.2 : 0.1;
      if (movement.moveForward) {
        modelRef.current.position.z -= speed;
      }
      if (movement.moveBackward) {
        modelRef.current.position.z += speed;
      }
      if (movement.moveLeft) {
        modelRef.current.position.x -= speed;
      }
      if (movement.moveRight) {
        modelRef.current.position.x += speed;
      }
      if (movement.jump) {
        modelRef.current.position.y += speed;
      }
    }
  });

  return null;
};

type SphericalPanoramaProps = {
  img: string;
};

// SphericalPanorama組件用於創建球型全景F
const SphericalPanorama: FC<SphericalPanoramaProps> = ({ img }) => {
  const texture = useLoader(TextureLoader, img);
  const meshRef = useRef<Mesh>(null!);

  useFrame(() => {
    // if (meshRef.current) {
    //   meshRef.current.rotation.y += 0.001;
    // }
  });

  return (
    <mesh scale={[-500, 500, 500]} ref={meshRef}>
      <sphereGeometry attach="geometry" args={[1, 60, 40]} />
      <meshBasicMaterial attach="material" map={texture} side={2} />
    </mesh>
  );
};

const App: FC = () => {
  const modelRef = useRef<Group>(null);
  return (
    <Suspense fallback={<span>loading...</span>}>
      <Canvas style={{ width: '100vw', height: '100vh' }} dpr={[1, 2]} camera={{ position: [-2, 2, 4], fov: 25 }}>
        <OrbitControls />
        <ambientLight intensity={0.5} />
        <SphericalPanorama img="futuristic-view-school-classroom-with-state-art-architecture.jpg" />
        <Suspense fallback={<Model url="AnyConv.com__uploads_files_4325342_Goomba.glb" />}>
          <Model url="AnyConv.com__uploads_files_4325342_Goomba.glb" ref={modelRef} />
        </Suspense>
        <MovementHandler modelRef={modelRef} />
      </Canvas>
    </Suspense>
  );
};

export default App;

