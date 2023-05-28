import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";

export default function Airplane({ ...props }) {
  const { nodes, materials } = useGLTF("/Airplane.gltf");
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.PUSHILIN_Plane_Circle000.geometry}
        material={materials.plane}
      />
    </group>
  );
}

useGLTF.preload("/Airplane.gltf");
