import React, { useMemo, useRef } from "react";
import { Float, PerspectiveCamera, useScroll, Text } from "@react-three/drei";
import Background from "./Background";
import Airplane from "./Airplane";
import Cloud from "./Cloud";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";

const LINE_NB_POINTS = 1000;
const CURVE_DISTANCE = 250;
const CURVE_AHEAD_CAMERA = 0.008;
const CURVE_AHEAD_AIRPLANE = 0.02;
const AIRPLANE_MAX_ANGLE = 35;

export default function Experience() {
  /* 곡선을 결정하는 부분 */
  const curve1 = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -CURVE_DISTANCE),
        new THREE.Vector3(100, 0, -2 * CURVE_DISTANCE),
        new THREE.Vector3(-100, 0, -3 * CURVE_DISTANCE),
        new THREE.Vector3(100, 0, -4 * CURVE_DISTANCE),
        new THREE.Vector3(0, 0, -5 * CURVE_DISTANCE),
        new THREE.Vector3(0, 0, -6 * CURVE_DISTANCE),
        new THREE.Vector3(0, 0, -7 * CURVE_DISTANCE),
      ],
      false,
      "catmullrom",
      0.5
    );
  }, []);

  const curve2 = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -CURVE_DISTANCE),
        new THREE.Vector3(0, 0, -2 * CURVE_DISTANCE),
        new THREE.Vector3(-100, 0, -3 * CURVE_DISTANCE),
        new THREE.Vector3(100, 0, -4 * CURVE_DISTANCE),
        new THREE.Vector3(0, 0, -5 * CURVE_DISTANCE),
        new THREE.Vector3(0, 0, -6 * CURVE_DISTANCE),
        new THREE.Vector3(0, 0, -7 * CURVE_DISTANCE),
      ],
      false,
      "catmullrom",
      0.5
    );
  }, []);

  // 곡선의 모양 지정
  const shape = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -0.08);
    shape.lineTo(0, 0.08);

    return shape;
  }, [curve1]);

  // 카메라 그룹지정
  const cameraGroup = useRef();

  // 스크롤 시 모션지정
  const scroll = useScroll();
  useFrame((_state, delta) => {
    // 스크롤 시 카메라가 비행기 따라가도록 설정
    const scrollOffset = Math.max(0, scroll.offset);
    const cntPoint = curve1.getPoint(scrollOffset);
    cameraGroup.current.position.lerp(cntPoint, delta * 24);

    // lookAt 포인트 지정
    const lookAtPoint = curve1.getPoint(
      Math.min(scrollOffset + CURVE_AHEAD_CAMERA, 1)
    );

    const cntLookAt = cameraGroup.current.getWorldDirection(
      new THREE.Vector3()
    );
    const targetLookAt = new THREE.Vector3()
      .subVectors(cntPoint, lookAtPoint)
      .normalize();

    const lookAt = cntLookAt.lerp(targetLookAt, delta * 24);
    cameraGroup.current.lookAt(
      cameraGroup.current.position.clone().add(lookAt)
    );

    // 비행기 기울여지는 효과

    const tangent = curve1.getTangent(scrollOffset + CURVE_AHEAD_AIRPLANE);

    const nonLerpLookAt = new Group();
    nonLerpLookAt.position.copy(cntPoint);
    nonLerpLookAt.lookAt(nonLerpLookAt.position.clone().add(targetLookAt));

    tangent.applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      -nonLerpLookAt.rotation.y
    );

    let angle = Math.atan2(-tangent.z, tangent.x);
    angle = -Math.PI / 2 + angle;

    let angleDegrees = (angle * 180) / Math.PI;
    angleDegrees *= 2.4;

    // 비행기 기울여지는 각도 제한
    if (angleDegrees < 0) {
      angleDegrees = Math.max(angleDegrees, -AIRPLANE_MAX_ANGLE);
    }
    if (angleDegrees > 0) {
      angleDegrees = Math.min(angleDegrees, AIRPLANE_MAX_ANGLE);
    }

    // 각도 잡기
    angle = (angleDegrees * Math.PI) / 180;

    const targetAirplaneQuaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        airplane.current.rotation.x,
        airplane.current.rotation.y,
        angle
      )
    );
    airplane.current.quaternion.slerp(targetAirplaneQuaternion, delta * 2);
  });

  const airplane = useRef();
  return (
    <>
      <directionalLight position={[0, 3, 1]} intensity={0.1} />
      <group ref={cameraGroup}>
        <Background />
        <PerspectiveCamera position={[0, 0, 5]} fov={30} makeDefault />
        {/* 비행기 */}
        <group ref={airplane}>
          <Float floatIntensity={2} speed={2} rotationIntensity={0.5}>
            <Airplane
              rotation-y={Math.PI / 2}
              scale={[0.2, 0.2, 0.2]}
              position-y={0.1}
            />
          </Float>
        </group>
      </group>

      {/* 텍스트 */}
      <group position={[-1, 2, -10]}>
        <Text
          color="white"
          anchorX="left"
          anchorY="middle"
          fontSize={0.22}
          maxWidth={2.5}
          font={"./fonts/Inter-Regular.ttf"}
        >
          Our lives are always at a crossroads.
        </Text>
      </group>

      <group position={[-10, 1, -200]}>
        <Text
          color="white"
          anchorX={"left"}
          anchorY="top"
          position-y={-0.66}
          fontSize={0.22}
          maxWidth={2.5}
          font={"./fonts/Inter-Regular.ttf"}
        >
          And we're often put in situations where we have to make a choice.
        </Text>
      </group>

      <group position={[2, 1, -250]}>
        <Text
          color="white"
          anchorX={"left"}
          anchorY="top"
          position-y={-0.66}
          fontSize={0.22}
          maxWidth={2.5}
          font={"./fonts/Inter-Regular.ttf"}
        >
          And like any good choice, there will always be regrets.
        </Text>
      </group>

      <group position={[72, 1, -400]}>
        <Text
          color="white"
          anchorX={"left"}
          anchorY="top"
          position-y={-0.66}
          fontSize={0.22}
          maxWidth={2.5}
          font={"./fonts/Inter-Regular.ttf"}
        >
          Maybe the choice is to do the easy thing the hard way,
        </Text>
      </group>

      <group position={[-62, 1, -680]}>
        <Text
          color="white"
          anchorX={"left"}
          anchorY="top"
          position-y={-0.66}
          fontSize={0.22}
          maxWidth={2.5}
          font={"./fonts/Inter-Regular.ttf"}
        >
          or, conversely, make something difficult easier,
        </Text>
      </group>

      <group position={[-28, 1, -860]}>
        <Text
          color="white"
          anchorX={"left"}
          anchorY="top"
          position-y={-0.66}
          fontSize={0.22}
          maxWidth={2.5}
          font={"./fonts/Inter-Regular.ttf"}
        >
          Fear of not choosing a better outcome in the future creates regret.
        </Text>
      </group>

      <group position={[95, 1, -1000]}>
        <Text
          color="white"
          anchorX={"left"}
          anchorY="top"
          position-y={-0.66}
          fontSize={0.22}
          maxWidth={2.5}
          font={"./fonts/Inter-Regular.ttf"}
        >
          But what matters is, "Are you doing the best you can in the moment?"
        </Text>
      </group>

      <group position={[20, 1, -1200]}>
        <Text
          color="white"
          anchorX={"left"}
          anchorY="top"
          position-y={-0.66}
          fontSize={0.22}
          maxWidth={2.5}
          font={"./fonts/Inter-Regular.ttf"}
        >
          The pain or responsibility that comes with a choice makes us more
          mature.
        </Text>
      </group>

      <group position={[-10, 1, -1300]}>
        <Text
          color="white"
          anchorX={"left"}
          anchorY="top"
          position-y={-0.66}
          fontSize={0.22}
          maxWidth={2.5}
          font={"./fonts/Inter-Regular.ttf"}
        >
          The sweet consequences of our choices are the rewards for our efforts.
        </Text>
      </group>

      <group position={[-8, 1, -1400]}>
        <Text
          color="white"
          anchorX={"left"}
          anchorY="top"
          position-y={-0.66}
          fontSize={0.22}
          maxWidth={2.5}
          font={"./fonts/Inter-Regular.ttf"}
        >
          Whatever the case, choices make us stronger.
        </Text>
      </group>

      <group position={[-3, 1, -1500]}>
        <Text
          color="white"
          anchorX={"left"}
          anchorY="top"
          position-y={-0.66}
          fontSize={0.22}
          maxWidth={2.5}
          font={"./fonts/Inter-Regular.ttf"}
        >
          So don't be afraid to make choices.
        </Text>
      </group>

      <group position={[2, 1, -1550]}>
        <Text
          color="white"
          anchorX={"left"}
          anchorY="top"
          position-y={-0.66}
          fontSize={0.22}
          maxWidth={2.5}
          font={"./fonts/Inter-Regular.ttf"}
        >
          Sending you words of comfort and encouragement as you live your life
          today.
        </Text>
      </group>

      <group position={[-1.6, 2, -1650]}>
        <Text
          color="white"
          weight={700}
          anchorX="middle"
          anchorY="top"
          position-y={-0.66}
          fontSize={0.22}
          maxWidth={4}
          font={"./fonts/Inter-Regular.ttf"}
        >
          You've done well, and you'll do well.
        </Text>
      </group>

      {/*비행경로*/}
      <group position-y={-2}>
        <mesh>
          <extrudeGeometry
            args={[
              shape,
              {
                steps: LINE_NB_POINTS,
                bevelEnabled: false,
                extrudePath: curve1,
              },
            ]}
          />
          <meshStandardMaterial color="white" transparent />
        </mesh>
        <mesh>
          <extrudeGeometry
            args={[
              shape,
              {
                steps: LINE_NB_POINTS,
                bevelEnabled: false,
                extrudePath: curve2,
              },
            ]}
          />
          <meshStandardMaterial color="white" transparent />
        </mesh>
      </group>

      {/*구름*/}
      <Cloud scale={[1, 1, 1.5]} position={[-3.5, -1.2, -7]} />
      <Cloud scale={[1, 1, 2]} position={[3.5, -1, -10]} rotation-y={Math.PI} />
      <Cloud
        scale={[1, 1, 1]}
        position={[-3.5, 0.2, -12]}
        rotation-y={Math.PI / 3}
      />
      <Cloud scale={[1, 1, 1]} position={[3.5, 0.2, -12]} />

      <Cloud
        scale={[0.4, 0.4, 0.4]}
        rotation-y={Math.PI / 9}
        position={[1, -0.2, -12]}
      />
      <Cloud scale={[0.3, 0.5, 2]} position={[-4, -0.5, -53]} />
      <Cloud scale={[0.8, 0.8, 0.8]} position={[-1, -1.5, -100]} />
      <Cloud scale={[0.8, 0.8, 0.8]} position={[-3.2, 0, -200]} />
      <Cloud scale={[0.8, 0.8, 0.8]} position={[-9, -1.5, -200]} />
      <Cloud
        scale={[0.8, 0.8, 0.8]}
        position={[-3, 0, -250]}
        rotation-y={Math.PI}
      />
      <Cloud scale={[0.8, 0.8, 0.8]} position={[3, -1.5, -250]} />
      <Cloud scale={[0.8, 0.8, 0.8]} position={[73, -1.5, -400]} />
      <Cloud
        scale={[0.8, 0.8, 0.8]}
        position={[79, 0, -400]}
        rotation-y={-Math.PI / 2}
      />
      <Cloud
        scale={[0.8, 0.8, 0.8]}
        position={[-70, 1, -680]}
        rotation-y={-Math.PI / 2}
      />
      <Cloud scale={[0.8, 0.8, 0.8]} position={[-60, -1.5, -680]} />
      <Cloud scale={[0.8, 0.8, 0.8]} position={[-28, -1.5, -860]} />
      <Cloud
        scale={[0.8, 0.8, 0.8]}
        position={[-20, -1.5, -860]}
        rotation-y={-Math.PI / 2}
      />
      <Cloud scale={[0.8, 0.8, 0.8]} position={[95, -1.5, -1000]} />
      <Cloud
        scale={[0.8, 0.8, 0.8]}
        position={[103, 0, -1000]}
        rotation-y={-Math.PI / 3}
      />
      <Cloud scale={[0.8, 0.8, 0.8]} position={[21, -1.5, -1200]} />
      <Cloud
        scale={[0.8, 0.8, 0.8]}
        position={[15, 1, -1200]}
        rotation-y={Math.PI / 3}
      />
      <Cloud scale={[0.8, 0.8, 0.8]} position={[-10, -1.5, -1300]} />
      <Cloud
        scale={[0.8, 0.8, 0.8]}
        position={[-3, 1, -1300]}
        rotation-y={-Math.PI / 3}
      />
      <Cloud
        scale={[0.8, 0.8, 0.8]}
        position={[-8, -1.5, -1400]}
        rotation-y={Math.PI / 3}
      />
      <Cloud
        scale={[0.8, 0.8, 0.8]}
        position={[-2, 1, -1400]}
        rotation-y={-Math.PI / 3}
      />
      <Cloud
        scale={[0.8, 0.8, 0.8]}
        position={[-3, -1.5, -1500]}
        rotation-y={Math.PI}
      />
      <Cloud scale={[0.8, 0.8, 0.8]} position={[3, 0, -1500]} />
      <Cloud
        scale={[0.8, 0.8, 0.8]}
        position={[-2, 0, -1550]}
        rotation-y={Math.PI / 3}
      />
    </>
  );
}
