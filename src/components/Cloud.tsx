import React from "react";
import { useGLTF } from "@react-three/drei";

export default function Cloud({ opacity, ...props }) {
  const { nodes, materials } = useGLTF("/Cloud.gltf");
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Node.geometry}>
        <meshStandardMaterial
          {...materials["lambert2SG"]}
          transparent
          opacity={opacity}
        />
      </mesh>
    </group>
  );
}

useGLTF.preload("/Cloud.gltf");
