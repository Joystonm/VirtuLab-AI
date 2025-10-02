import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Plane } from '@react-three/drei';
import { useLab } from '../context/LabContext';
import CircuitTool from '../components/LabTools/CircuitTool';

const PhysicsLab = () => {
  const { labObjects, selectedTool, addObject } = useLab();
  const labRef = useRef();

  const handleClick = (event) => {
    if (!selectedTool) return;
    
    const position = [
      event.point.x,
      event.point.y + 0.5,
      event.point.z
    ];

    addObject({
      type: selectedTool,
      position,
      rotation: [0, 0, 0]
    });
  };

  return (
    <group ref={labRef}>
      {/* Lab Table */}
      <Box
        args={[8, 0.2, 6]}
        position={[0, 0, 0]}
        onClick={handleClick}
      >
        <meshStandardMaterial color="#8B4513" />
      </Box>

      {/* Lab Floor */}
      <Plane
        args={[20, 20]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1, 0]}
      >
        <meshStandardMaterial color="#f0f0f0" />
      </Plane>

      {/* Render Lab Objects */}
      {labObjects.map((obj) => (
        <LabObject key={obj.id} object={obj} />
      ))}

      {/* Circuit Tool Component */}
      <CircuitTool />
    </group>
  );
};

const LabObject = ({ object }) => {
  const getObjectMesh = () => {
    switch (object.type) {
      case 'battery':
        return (
          <Box args={[0.5, 0.3, 1]} position={object.position}>
            <meshStandardMaterial color="#FFD700" />
          </Box>
        );
      case 'bulb':
        return (
          <mesh position={object.position}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#FFFF99" transparent opacity={0.8} />
          </mesh>
        );
      case 'wire':
        return (
          <Box args={[1, 0.05, 0.05]} position={object.position}>
            <meshStandardMaterial color="#FF6B35" />
          </Box>
        );
      default:
        return (
          <Box args={[0.3, 0.3, 0.3]} position={object.position}>
            <meshStandardMaterial color="#666" />
          </Box>
        );
    }
  };

  return getObjectMesh();
};

export default PhysicsLab;
