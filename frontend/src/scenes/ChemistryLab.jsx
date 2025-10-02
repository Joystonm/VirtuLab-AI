import React from 'react';
import { Box, Plane, Cylinder } from '@react-three/drei';
import { useLab } from '../context/LabContext';

const ChemistryLab = () => {
  const { labObjects, selectedTool, addObject } = useLab();

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
    <group>
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

      {/* Render Chemistry Objects */}
      {labObjects.map((obj) => (
        <ChemistryObject key={obj.id} object={obj} />
      ))}
    </group>
  );
};

const ChemistryObject = ({ object }) => {
  const getObjectMesh = () => {
    switch (object.type) {
      case 'beaker':
        return (
          <Cylinder args={[0.3, 0.3, 0.8, 16]} position={object.position}>
            <meshStandardMaterial color="#E6F3FF" transparent opacity={0.7} />
          </Cylinder>
        );
      case 'acid':
        return (
          <Cylinder args={[0.15, 0.15, 0.6, 16]} position={object.position}>
            <meshStandardMaterial color="#FFFF00" transparent opacity={0.8} />
          </Cylinder>
        );
      case 'base':
        return (
          <Cylinder args={[0.15, 0.15, 0.6, 16]} position={object.position}>
            <meshStandardMaterial color="#0066FF" transparent opacity={0.8} />
          </Cylinder>
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

export default ChemistryLab;
