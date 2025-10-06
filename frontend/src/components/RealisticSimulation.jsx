import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Sphere, Cylinder, Plane } from '@react-three/drei';

const RealisticSimulation = ({ experimentType, isPlaying, onMeasurement, onPromptChange, parameters = {} }) => {
  const renderExperiment = () => {
    switch (experimentType) {
      case 'pendulum':
        return <PendulumExperiment isPlaying={isPlaying} onMeasurement={onMeasurement} onPromptChange={onPromptChange} parameters={parameters} />;
      case 'spring':
        return <SpringExperiment isPlaying={isPlaying} onMeasurement={onMeasurement} onPromptChange={onPromptChange} parameters={parameters} />;
      case 'incline':
        return <InclineExperiment isPlaying={isPlaying} onMeasurement={onMeasurement} onPromptChange={onPromptChange} parameters={parameters} />;
      case 'newton':
        return <NewtonExperiment isPlaying={isPlaying} onMeasurement={onMeasurement} onPromptChange={onPromptChange} parameters={parameters} />;
      case 'lens':
        return <LensExperiment isPlaying={isPlaying} onMeasurement={onMeasurement} onPromptChange={onPromptChange} parameters={parameters} />;
      case 'mirror':
        return <MirrorExperiment isPlaying={isPlaying} onMeasurement={onMeasurement} onPromptChange={onPromptChange} parameters={parameters} />;
      default:
        return null;
    }
  };

  return (
    <group>
      <Plane args={[25, 25]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
        <meshStandardMaterial color="#f8fafc" />
      </Plane>
      <gridHelper args={[20, 20, '#e2e8f0', '#f1f5f9']} position={[0, -2.9, 0]} />
      {renderExperiment()}
    </group>
  );
};

// Real-time Reactive Pendulum
const PendulumExperiment = ({ isPlaying, onMeasurement, onPromptChange, parameters }) => {
  const pendulumRef = useRef();
  const stringRef = useRef();
  const [state, setState] = useState({ theta: 0, omega: 0, time: 0, cycles: 0 });
  
  // Reactive parameters - update immediately when changed
  const L = parameters.length || 2.0;
  const m = parameters.mass || 1.0;
  const b = parameters.damping || 0.05;
  const theta0 = parameters.initialAngle || Math.PI / 6;
  const g = 9.81;
  
  // Reset simulation when parameters change
  useEffect(() => {
    setState({ theta: theta0, omega: 0, time: 0, cycles: 0 });
  }, [L, m, b, theta0]);
  
  useFrame((_, delta) => {
    if (!isPlaying || !pendulumRef.current) return;
    
    setState(prev => {
      const dt = delta;
      
      // Real pendulum differential equation
      const alpha = -(g / L) * Math.sin(prev.theta) - (b / m) * prev.omega;
      const newOmega = prev.omega + alpha * dt;
      const newTheta = prev.theta + newOmega * dt;
      const newTime = prev.time + dt;
      
      // Update visual elements
      pendulumRef.current.rotation.z = newTheta;
      if (stringRef.current) {
        stringRef.current.scale.y = 1;
        stringRef.current.position.y = 2 - L/2;
      }
      
      // Energy calculations
      const height = L * (1 - Math.cos(Math.abs(newTheta)));
      const PE = m * g * height;
      const KE = 0.5 * m * L * L * newOmega * newOmega;
      const totalEnergy = PE + KE;
      
      // Period calculation with current parameters
      const theoreticalPeriod = 2 * Math.PI * Math.sqrt(L / g);
      const frequency = 1 / theoreticalPeriod;
      
      onMeasurement({
        'Length (m)': L.toFixed(2),
        'Period (s)': theoreticalPeriod.toFixed(3),
        'Frequency (Hz)': frequency.toFixed(3),
        'Angle (°)': (newTheta * 180 / Math.PI).toFixed(2),
        'Angular Velocity (rad/s)': newOmega.toFixed(3),
        'PE (J)': PE.toFixed(3),
        'KE (J)': KE.toFixed(3),
        'Total Energy (J)': totalEnergy.toFixed(3)
      });
      
      // Update equation display
      onPromptChange(`T = 2π√(${L.toFixed(1)}/9.81) = ${theoreticalPeriod.toFixed(2)}s. Mass = ${m.toFixed(1)}kg (doesn't affect period!)`);
      
      return { theta: newTheta, omega: newOmega, time: newTime, cycles: prev.cycles };
    });
  });

  return (
    <group position={[0, 2, 0]}>
      <Box args={[0.3, 0.3, 0.3]} position={[0, 2, 0]}>
        <meshStandardMaterial color="#374151" />
      </Box>
      <Cylinder ref={stringRef} args={[0.008, 0.008, L]} position={[0, 2 - L/2, 0]}>
        <meshStandardMaterial color="#1f2937" />
      </Cylinder>
      <group ref={pendulumRef}>
        <Sphere args={[0.1 + m * 0.05]} position={[0, 2 - L, 0]}>
          <meshStandardMaterial color="#06b6d4" />
        </Sphere>
      </group>
    </group>
  );
};

// Real Physics Spring-Mass System
const SpringExperiment = ({ isPlaying, onMeasurement, onPromptChange, parameters }) => {
  const massRef = useRef();
  const springRef = useRef();
  const [state, setState] = useState({
    x: parameters.initialDisplacement || 0.5,
    v: 0,
    time: 0
  });
  
  const m = parameters.mass || 1.0;
  const k = parameters.springConstant || 10.0;
  const b = parameters.damping || 0.2;
  const equilibrium = 0;
  
  useFrame((_, delta) => {
    if (!isPlaying || !massRef.current) return;
    
    setState(prev => {
      const dt = delta;
      
      // Hooke's Law + Damping: F = -kx - bv, a = F/m
      const F_spring = -k * prev.x;
      const F_damping = -b * prev.v;
      const F_total = F_spring + F_damping;
      const acceleration = F_total / m;
      
      const newV = prev.v + acceleration * dt;
      const newX = prev.x + newV * dt;
      const newTime = prev.time + dt;
      
      // Energy calculations
      const KE = 0.5 * m * newV * newV;
      const PE = 0.5 * k * newX * newX;
      const totalEnergy = KE + PE;
      
      // Update positions
      massRef.current.position.y = equilibrium + newX;
      
      // Update spring visualization
      if (springRef.current) {
        const springLength = 2 + newX;
        springRef.current.scale.y = springLength / 2;
        springRef.current.position.y = springLength / 2 - 1;
      }
      
      onMeasurement({
        'Displacement (m)': newX.toFixed(3),
        'Velocity (m/s)': newV.toFixed(3),
        'Acceleration (m/s²)': acceleration.toFixed(3),
        'Spring Force (N)': F_spring.toFixed(2),
        'Damping Force (N)': F_damping.toFixed(2),
        'KE (J)': KE.toFixed(3),
        'PE (J)': PE.toFixed(3),
        'Total Energy (J)': totalEnergy.toFixed(3)
      });
      
      return { x: newX, v: newV, time: newTime };
    });
  });

  // Create spring coil geometry
  const SpringCoil = () => {
    const points = [];
    const coils = 12;
    const radius = 0.3;
    
    for (let i = 0; i <= coils * 20; i++) {
      const t = i / 20;
      const x = radius * Math.cos(t * Math.PI * 2);
      const z = radius * Math.sin(t * Math.PI * 2);
      const y = (t / coils) * 2 - 1;
      points.push([x, y, z]);
    }
    
    return (
      <group ref={springRef}>
        {points.map((point, i) => (
          <Sphere key={i} args={[0.02]} position={point}>
            <meshStandardMaterial color="#10b981" />
          </Sphere>
        ))}
      </group>
    );
  };

  return (
    <group>
      {/* Fixed support */}
      <Box args={[2, 0.3, 2]} position={[0, 2, 0]}>
        <meshStandardMaterial color="#64748b" />
      </Box>
      
      {/* Spring */}
      <SpringCoil />
      
      {/* Mass */}
      <Box ref={massRef} args={[0.6, 0.6, 0.6]} position={[0, equilibrium, 0]}>
        <meshStandardMaterial color="#0ea5e9" />
      </Box>
      
      {/* Equilibrium line */}
      <Box args={[1.5, 0.02, 0.02]} position={[0, equilibrium, 0]}>
        <meshStandardMaterial color="#ef4444" />
      </Box>
    </group>
  );
};

// Real Physics Inclined Plane
const InclineExperiment = ({ isPlaying, onMeasurement, onPromptChange, parameters }) => {
  const blockRef = useRef();
  const planeRef = useRef();
  
  const [state, setState] = useState({
    position: 0,
    velocity: 0,
    time: 0
  });
  
  // Real-time reactive parameters
  const m = parameters.mass || 2.0;
  const theta = (parameters.angle || 20) * Math.PI / 180;
  const mu = parameters.friction || 0.3;
  const g = 9.81;
  const planeLength = 4;
  
  // Reset when parameters change
  React.useEffect(() => {
    setState({ position: 0, velocity: 0, time: 0 });
  }, [m, theta, mu]);
  
  useFrame((_, delta) => {
    if (!blockRef.current || !planeRef.current) return;
    
    // Physics calculations
    const F_gravity = m * g * Math.sin(theta);
    const F_normal = m * g * Math.cos(theta);
    const F_friction = mu * F_normal;
    const F_net = F_gravity - F_friction;
    
    // Static friction check: μ ≥ tan(θ)
    const shouldStayStill = mu >= Math.tan(theta);
    
    setState(prev => {
      if (!isPlaying) return prev;
      
      const dt = delta;
      let newPosition = prev.position;
      let newVelocity = prev.velocity;
      
      if (!shouldStayStill && F_net > 0) {
        // Block accelerates: a = F_net / m
        const acceleration = F_net / m;
        newVelocity = prev.velocity + acceleration * dt;
        newPosition = prev.position + newVelocity * dt;
        
        // Reset if reaches end
        if (newPosition > planeLength * 0.8) {
          newPosition = 0;
          newVelocity = 0;
        }
      }
      
      // Position block on plane surface
      const blockX = -planeLength/2 + newPosition;
      const blockY = 0.2 + newPosition * Math.sin(theta);
      
      blockRef.current.position.set(blockX, blockY, 0);
      blockRef.current.rotation.z = -theta;
      
      // Measurements
      onMeasurement({
        'Status': shouldStayStill ? 'Static' : 'Sliding',
        'Mass (kg)': m.toFixed(1),
        'Angle (°)': (theta * 180 / Math.PI).toFixed(1),
        'Friction μ': mu.toFixed(2),
        'Gravity Force (N)': F_gravity.toFixed(2),
        'Normal Force (N)': F_normal.toFixed(2),
        'Friction Force (N)': F_friction.toFixed(2),
        'Net Force (N)': F_net.toFixed(2),
        'Acceleration (m/s²)': shouldStayStill ? '0.00' : (F_net/m).toFixed(2),
        'Velocity (m/s)': newVelocity.toFixed(2)
      });
      
      return { position: newPosition, velocity: newVelocity, time: prev.time + dt };
    });
  });

  // Force Arrow Component
  const ForceArrow = ({ position, direction, magnitude, color, label }) => {
    const length = magnitude * 0.003;
    return (
      <group position={position}>
        <Cylinder 
          args={[0.02, 0.02, length]} 
          position={[0, length/2, 0]}
          rotation={direction}
        >
          <meshStandardMaterial color={color} />
        </Cylinder>
        <Cylinder 
          args={[0.05, 0, 0.1]} 
          position={[0, length, 0]}
          rotation={direction}
        >
          <meshStandardMaterial color={color} />
        </Cylinder>
      </group>
    );
  };

  const blockPosition = blockRef.current ? blockRef.current.position : { x: -planeLength/2, y: 0.2, z: 0 };
  const F_gravity = m * g * Math.sin(theta);
  const F_normal = m * g * Math.cos(theta);
  const F_friction = mu * F_normal;

  return (
    <group>
      {/* Inclined Plane */}
      <Box 
        ref={planeRef}
        args={[planeLength, 0.1, 1.5]} 
        position={[0, 0, 0]} 
        rotation={[0, 0, -theta]}
      >
        <meshStandardMaterial color="#e5e7eb" />
      </Box>
      
      {/* Grid lines on plane */}
      <gridHelper 
        args={[planeLength, 10, '#d1d5db', '#f3f4f6']} 
        position={[0, 0.06, 0]} 
        rotation={[0, 0, -theta]}
      />
      
      {/* Block */}
      <Box 
        ref={blockRef} 
        args={[0.4, 0.4, 0.4]} 
        position={[-planeLength/2, 0.2, 0]}
      >
        <meshStandardMaterial color="#0ea5e9" />
      </Box>
      
      {/* Force Arrows */}
      <ForceArrow 
        position={[blockPosition.x, blockPosition.y + 0.5, 0]}
        direction={[0, 0, 0]}
        magnitude={m * g}
        color="#ef4444"
        label="Weight"
      />
      
      <ForceArrow 
        position={[blockPosition.x - 0.3, blockPosition.y, 0]}
        direction={[0, 0, Math.PI/2 - theta]}
        magnitude={F_normal}
        color="#22c55e"
        label="Normal"
      />
      
      <ForceArrow 
        position={[blockPosition.x + 0.3, blockPosition.y, 0]}
        direction={[0, 0, theta]}
        magnitude={F_friction}
        color="#eab308"
        label="Friction"
      />
      
      {/* Ground */}
      <Box args={[8, 0.05, 3]} position={[0, -0.8, 0]}>
        <meshStandardMaterial color="#64748b" />
      </Box>
      
      {/* Angle indicator */}
      <Cylinder args={[0.5, 0.5, 0.02]} position={[-planeLength/2, -0.1, 0]} rotation={[Math.PI/2, 0, 0]}>
        <meshStandardMaterial color="#f59e0b" transparent opacity={0.3} />
      </Cylinder>
    </group>
  );
};

// Real Physics Newton's Laws
const NewtonExperiment = ({ isPlaying, onMeasurement, onPromptChange, parameters }) => {
  const cartRef = useRef();
  const forceArrowRef = useRef();
  const [state, setState] = useState({
    x: 0,
    v: 0,
    time: 0
  });
  
  const m = parameters.mass || 2.0;
  const F_applied = parameters.force || 5.0;
  const friction = parameters.friction || 0.5;
  
  useFrame((_, delta) => {
    if (!isPlaying || !cartRef.current) return;
    
    setState(prev => {
      const dt = delta;
      
      // Newton's Second Law: F = ma
      // Net force = Applied force - friction
      const F_friction = friction * prev.v; // Velocity-dependent friction
      const F_net = F_applied - F_friction;
      const acceleration = F_net / m;
      
      const newV = prev.v + acceleration * dt;
      const newX = prev.x + newV * dt;
      const newTime = prev.time + dt;
      
      // Reset if cart goes too far
      const resetX = Math.abs(newX) > 4 ? 0 : newX;
      const resetV = Math.abs(newX) > 4 ? 0 : newV;
      
      cartRef.current.position.x = resetX;
      
      // Update force arrow
      if (forceArrowRef.current) {
        const arrowLength = Math.abs(F_applied) * 0.1;
        forceArrowRef.current.scale.x = arrowLength;
        forceArrowRef.current.position.x = resetX + (F_applied > 0 ? 0.5 : -0.5);
      }
      
      onMeasurement({
        'Applied Force (N)': F_applied.toFixed(1),
        'Friction Force (N)': F_friction.toFixed(2),
        'Net Force (N)': F_net.toFixed(2),
        'Mass (kg)': m.toFixed(1),
        'Acceleration (m/s²)': acceleration.toFixed(2),
        'Velocity (m/s)': resetV.toFixed(2),
        'Position (m)': resetX.toFixed(2),
        'Momentum (kg⋅m/s)': (m * resetV).toFixed(2),
        'Kinetic Energy (J)': (0.5 * m * resetV * resetV).toFixed(2)
      });
      
      return { x: resetX, v: resetV, time: newTime };
    });
  });

  return (
    <group>
      {/* Track */}
      <Box args={[8, 0.1, 0.6]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#64748b" />
      </Box>
      
      {/* Track rails */}
      <Box args={[8, 0.05, 0.05]} position={[0, 0.1, 0.25]}>
        <meshStandardMaterial color="#374151" />
      </Box>
      <Box args={[8, 0.05, 0.05]} position={[0, 0.1, -0.25]}>
        <meshStandardMaterial color="#374151" />
      </Box>
      
      {/* Cart */}
      <Box ref={cartRef} args={[0.8, 0.4, 0.6]} position={[0, 0.4, 0]}>
        <meshStandardMaterial color="#3b82f6" />
      </Box>
      
      {/* Wheels */}
      <Cylinder args={[0.1, 0.1, 0.05]} rotation={[Math.PI/2, 0, 0]} position={[0.3, 0.1, 0.3]}>
        <meshStandardMaterial color="#1f2937" />
      </Cylinder>
      <Cylinder args={[0.1, 0.1, 0.05]} rotation={[Math.PI/2, 0, 0]} position={[0.3, 0.1, -0.3]}>
        <meshStandardMaterial color="#1f2937" />
      </Cylinder>
      <Cylinder args={[0.1, 0.1, 0.05]} rotation={[Math.PI/2, 0, 0]} position={[-0.3, 0.1, 0.3]}>
        <meshStandardMaterial color="#1f2937" />
      </Cylinder>
      <Cylinder args={[0.1, 0.1, 0.05]} rotation={[Math.PI/2, 0, 0]} position={[-0.3, 0.1, -0.3]}>
        <meshStandardMaterial color="#1f2937" />
      </Cylinder>
      
      {/* Force Arrow */}
      <group ref={forceArrowRef} position={[0, 0.8, 0]}>
        <Cylinder args={[0.03, 0.03, 1]} rotation={[0, 0, Math.PI/2]}>
          <meshStandardMaterial color="#ef4444" />
        </Cylinder>
        <Cylinder args={[0.08, 0, 0.15]} rotation={[0, 0, Math.PI/2]} position={[0.5, 0, 0]}>
          <meshStandardMaterial color="#ef4444" />
        </Cylinder>
      </group>
      
      {/* Position markers */}
      {[-3, -2, -1, 0, 1, 2, 3].map(pos => (
        <Box key={pos} args={[0.02, 0.3, 0.02]} position={[pos, -0.1, 0]}>
          <meshStandardMaterial color="#6b7280" />
        </Box>
      ))}
      
      {/* Ground */}
      <Box args={[10, 0.05, 2]} position={[0, -0.5, 0]}>
        <meshStandardMaterial color="#9ca3af" />
      </Box>
    </group>
  );
};

// Real Optics - Convex Lens
const LensExperiment = ({ isPlaying, onMeasurement, onPromptChange, parameters }) => {
  const objectRef = useRef();
  const imageRef = useRef();
  const rayRefs = useRef([]);
  
  const objectDistance = parameters.objectDistance || 30;
  const focalLength = parameters.focalLength || 15;
  const objectHeight = 2;
  
  // Lens equation: 1/f = 1/do + 1/di
  const imageDistance = (focalLength * objectDistance) / (objectDistance - focalLength);
  const magnification = -imageDistance / objectDistance;
  const imageHeight = Math.abs(magnification) * objectHeight;
  const isReal = imageDistance > 0;
  const isInverted = magnification < 0;
  
  // Convert to 3D positions (scale down for better visualization)
  const objPos = -objectDistance / 10;
  const imgPos = imageDistance / 10;
  const focalPos = focalLength / 10;
  
  React.useEffect(() => {
    if (objectRef.current) {
      objectRef.current.position.x = objPos;
    }
    if (imageRef.current) {
      imageRef.current.position.x = imgPos;
      imageRef.current.scale.y = imageHeight / objectHeight;
      // Set opacity on all children materials
      imageRef.current.traverse((child) => {
        if (child.material) {
          child.material.opacity = isReal ? 1.0 : 0.5;
          child.material.transparent = true;
        }
      });
    }
  }, [objPos, imgPos, imageHeight, isReal]);

  onMeasurement({
    'Object Distance (cm)': objectDistance.toFixed(1),
    'Focal Length (cm)': focalLength.toFixed(1),
    'Image Distance (cm)': imageDistance.toFixed(1),
    'Magnification': magnification.toFixed(2),
    'Image Height (cm)': imageHeight.toFixed(1),
    'Image Type': isReal ? 'Real, Inverted' : 'Virtual, Upright',
    'Image Nature': isReal ? 'Can be projected' : 'Cannot be projected'
  });

  // Ray paths for visualization
  const RayPath = ({ start, end, color }) => (
    <group>
      <Cylinder 
        args={[0.01, 0.01, Math.sqrt((end[0]-start[0])**2 + (end[1]-start[1])**2)]}
        position={[(start[0]+end[0])/2, (start[1]+end[1])/2, 0]}
        rotation={[0, 0, Math.atan2(end[1]-start[1], end[0]-start[0])]}
      >
        <meshStandardMaterial color={color} />
      </Cylinder>
    </group>
  );

  return (
    <group>
      {/* Optical bench */}
      <Box args={[10, 0.1, 0.3]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#64748b" />
      </Box>
      
      {/* Lens */}
      <Cylinder args={[1.2, 1.2, 0.1]} rotation={[Math.PI/2, 0, 0]} position={[0, 0.6, 0]}>
        <meshStandardMaterial color="#60a5fa" transparent opacity={0.7} />
      </Cylinder>
      
      {/* Lens edges (thicker at center) */}
      <Cylinder args={[1.2, 1.0, 0.05]} rotation={[Math.PI/2, 0, 0]} position={[0, 0.6, 0.08]}>
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.8} />
      </Cylinder>
      <Cylinder args={[1.2, 1.0, 0.05]} rotation={[Math.PI/2, 0, 0]} position={[0, 0.6, -0.08]}>
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.8} />
      </Cylinder>
      
      {/* Principal axis */}
      <Cylinder args={[0.01, 0.01, 10]} rotation={[0, Math.PI/2, 0]} position={[0, 0.6, 0]}>
        <meshStandardMaterial color="#6b7280" />
      </Cylinder>
      
      {/* Focal points */}
      <Sphere args={[0.05]} position={[focalPos, 0.6, 0]}>
        <meshStandardMaterial color="#f59e0b" />
      </Sphere>
      <Sphere args={[0.05]} position={[-focalPos, 0.6, 0]}>
        <meshStandardMaterial color="#f59e0b" />
      </Sphere>
      
      {/* Object (red arrow) */}
      <group ref={objectRef} position={[objPos, 0.6, 0]}>
        <Cylinder args={[0.05, 0.05, objectHeight]} position={[0, objectHeight/2, 0]}>
          <meshStandardMaterial color="#ef4444" />
        </Cylinder>
        <Cylinder args={[0.1, 0, 0.2]} position={[0, objectHeight, 0]}>
          <meshStandardMaterial color="#ef4444" />
        </Cylinder>
      </group>
      
      {/* Image (green arrow) */}
      <group ref={imageRef} position={[imgPos, 0.6, 0]}>
        <Cylinder 
          args={[0.05, 0.05, objectHeight]} 
          position={[0, isInverted ? -objectHeight/2 : objectHeight/2, 0]}
          rotation={isInverted ? [0, 0, Math.PI] : [0, 0, 0]}
        >
          <meshStandardMaterial color="#22c55e" transparent />
        </Cylinder>
        <Cylinder 
          args={[0.1, 0, 0.2]} 
          position={[0, isInverted ? -objectHeight : objectHeight, 0]}
          rotation={isInverted ? [0, 0, Math.PI] : [0, 0, 0]}
        >
          <meshStandardMaterial color="#22c55e" transparent />
        </Cylinder>
      </group>
      
      {/* Light rays */}
      <RayPath start={[objPos, 0.6 + objectHeight, 0]} end={[0, 0.6 + objectHeight, 0]} color="#fbbf24" />
      <RayPath start={[0, 0.6 + objectHeight, 0]} end={[imgPos, 0.6 + (isInverted ? -imageHeight : imageHeight), 0]} color="#fbbf24" />
      
      <RayPath start={[objPos, 0.6 + objectHeight, 0]} end={[0, 0.6, 0]} color="#f97316" />
      <RayPath start={[0, 0.6, 0]} end={[imgPos, 0.6 + (isInverted ? -imageHeight : imageHeight), 0]} color="#f97316" />
      
      {/* Scale markings */}
      {[-4, -3, -2, -1, 1, 2, 3, 4].map(pos => (
        <Box key={pos} args={[0.02, 0.2, 0.02]} position={[pos, 0.1, 0]}>
          <meshStandardMaterial color="#9ca3af" />
        </Box>
      ))}
    </group>
  );
};

// Ray visualization component
const MirrorRay = ({ start, end, color, dashed = false }) => {
  const length = Math.sqrt((end[0]-start[0])**2 + (end[1]-start[1])**2);
  return (
    <Cylinder 
      args={[0.01, 0.01, length]}
      position={[(start[0]+end[0])/2, (start[1]+end[1])/2, 0]}
      rotation={[0, 0, Math.atan2(end[1]-start[1], end[0]-start[0])]}
    >
      <meshStandardMaterial 
        color={color} 
        transparent 
        opacity={dashed ? 0.5 : 1.0}
      />
    </Cylinder>
  );
};

// Real Optics - Concave Mirror
const MirrorExperiment = ({ isPlaying, onMeasurement, onPromptChange, parameters }) => {
  const objectRef = useRef();
  const imageRef = useRef();
  const screenRef = useRef();
  
  const objectDistance = Math.max(5, parameters.objectDistance || 25);
  const focalLength = parameters.focalLength || 15;
  const objectHeight = 1.5;
  
  // Mirror equation: 1/f = 1/do + 1/di
  const imageDistance = (focalLength * objectDistance) / (objectDistance - focalLength);
  const magnification = -imageDistance / objectDistance;
  const imageHeight = Math.abs(magnification) * objectHeight;
  const isReal = imageDistance > 0 && objectDistance > focalLength;
  const isInverted = magnification < 0;
  
  // Scale positions for 3D (1 unit = 1 cm)
  const objPos = -objectDistance / 5;
  const imgPos = isReal ? -Math.abs(imageDistance) / 5 : objPos;
  const focalPos = -focalLength / 5;
  
  React.useEffect(() => {
    if (objectRef.current) {
      objectRef.current.position.x = objPos;
    }
    if (imageRef.current && isReal) {
      imageRef.current.position.x = imgPos;
      imageRef.current.scale.y = imageHeight / objectHeight;
      imageRef.current.visible = true;
    } else if (imageRef.current) {
      imageRef.current.visible = false;
    }
    if (screenRef.current && isReal) {
      screenRef.current.position.x = imgPos;
    }
  }, [objPos, imgPos, imageHeight, isReal]);

  onMeasurement({
    'Object Distance (cm)': objectDistance.toFixed(1),
    'Image Distance (cm)': imageDistance.toFixed(1),
    'Focal Length (cm)': focalLength.toFixed(1),
    'Magnification': magnification.toFixed(2),
    'Image Height (cm)': imageHeight.toFixed(1),
    'Image Type': isReal ? 'Real, Inverted' : 'Virtual, Upright'
  });

  // Ray calculation for proper reflection
  const calculateRayPath = (startX, startY, endX, endY) => {
    const length = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;
    const angle = Math.atan2(endY - startY, endX - startX);
    return { length, midX, midY, angle };
  };

  const Ray = ({ start, end, color, opacity = 1 }) => {
    const { length, midX, midY, angle } = calculateRayPath(start[0], start[1], end[0], end[1]);
    return (
      <Cylinder
        args={[0.008, 0.008, length]}
        position={[midX, midY, 0]}
        rotation={[0, 0, angle]}
      >
        <meshStandardMaterial color={color} transparent opacity={opacity} />
      </Cylinder>
    );
  };

  return (
    <group>
      {/* Clean optical bench */}
      <Box args={[12, 0.08, 0.3]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#2d3748" />
      </Box>
      
      {/* Principal axis */}
      <Cylinder args={[0.005, 0.005, 10]} rotation={[0, Math.PI/2, 0]} position={[-1, 0.8, 0]}>
        <meshStandardMaterial color="#4a5568" />
      </Cylinder>
      
      {/* Concave mirror - realistic parabolic shape */}
      <group position={[0, 0.8, 0]}>
        <Sphere args={[1.2]} position={[0.6, 0, 0]} scale={[-0.5, 1, 1]}>
          <meshStandardMaterial 
            color="#f7fafc" 
            metalness={0.98} 
            roughness={0.02}
          />
        </Sphere>
        <Cylinder args={[1.2, 1.2, 0.05]} rotation={[Math.PI/2, 0, 0]} position={[0.02, 0, 0]}>
          <meshStandardMaterial color="#1a202c" />
        </Cylinder>
      </group>
      
      {/* Mirror stand */}
      <Box args={[0.15, 1.6, 0.15]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#2d3748" />
      </Box>
      
      {/* Focal point marker */}
      <Sphere args={[0.03]} position={[focalPos, 0.8, 0]}>
        <meshStandardMaterial color="#f6ad55" emissive="#f6ad55" emissiveIntensity={0.2} />
      </Sphere>
      
      {/* Object (light source) */}
      <group ref={objectRef} position={[objPos, 0.8, 0]}>
        <Cylinder args={[0.03, 0.03, objectHeight]} position={[0, objectHeight/2, 0]}>
          <meshStandardMaterial color="#e53e3e" emissive="#e53e3e" emissiveIntensity={0.1} />
        </Cylinder>
        <Cylinder args={[0.06, 0, 0.15]} position={[0, objectHeight, 0]}>
          <meshStandardMaterial color="#e53e3e" />
        </Cylinder>
      </group>
      
      {/* Image (when real) */}
      {isReal && (
        <group ref={imageRef} position={[imgPos, 0.8, 0]}>
          <Cylinder 
            args={[0.03, 0.03, objectHeight]} 
            position={[0, -objectHeight/2, 0]}
            rotation={[0, 0, Math.PI]}
          >
            <meshStandardMaterial color="#38a169" transparent opacity={0.8} />
          </Cylinder>
          <Cylinder 
            args={[0.06, 0, 0.15]} 
            position={[0, -objectHeight, 0]}
            rotation={[0, 0, Math.PI]}
          >
            <meshStandardMaterial color="#38a169" transparent opacity={0.8} />
          </Cylinder>
        </group>
      )}
      
      {/* Screen for real images */}
      {isReal && (
        <Box ref={screenRef} args={[0.02, 2, 1]} position={[imgPos, 1.8, 0]}>
          <meshStandardMaterial color="#f7fafc" transparent opacity={0.7} />
        </Box>
      )}
      
      {/* Light rays following reflection laws */}
      {/* Ray 1: Parallel to axis → reflects through focus */}
      <Ray 
        start={[objPos, 0.8 + objectHeight, 0]} 
        end={[0, 0.8 + objectHeight, 0]} 
        color="#ffd700" 
      />
      <Ray 
        start={[0, 0.8 + objectHeight, 0]} 
        end={isReal ? [imgPos, 0.8 - imageHeight, 0] : [focalPos, 0.8, 0]} 
        color="#ffd700" 
        opacity={isReal ? 1 : 0.5}
      />
      
      {/* Ray 2: Through focus → reflects parallel to axis */}
      <Ray 
        start={[objPos, 0.8 + objectHeight, 0]} 
        end={[focalPos, 0.8, 0]} 
        color="#ff6b35" 
      />
      <Ray 
        start={[focalPos, 0.8, 0]} 
        end={isReal ? [imgPos, 0.8 - imageHeight, 0] : [0, 0.8 + objectHeight, 0]} 
        color="#ff6b35" 
        opacity={isReal ? 1 : 0.5}
      />
      
      {/* Ray 3: Through center → reflects back along same path */}
      <Ray 
        start={[objPos, 0.8 + objectHeight, 0]} 
        end={[focalPos * 2, 0.8, 0]} 
        color="#e53e3e" 
      />
      <Ray 
        start={[focalPos * 2, 0.8, 0]} 
        end={isReal ? [imgPos, 0.8 - imageHeight, 0] : [objPos, 0.8 + objectHeight, 0]} 
        color="#e53e3e" 
        opacity={isReal ? 1 : 0.3}
      />
      
      {/* Scale markings */}
      {[-5, -4, -3, -2, -1, 1, 2, 3, 4, 5].map(pos => (
        <Box key={pos} args={[0.01, 0.15, 0.01]} position={[pos, 0.1, 0]}>
          <meshStandardMaterial color="#718096" />
        </Box>
      ))}
      
      {/* Clean background */}
      <Box args={[15, 0.02, 6]} position={[0, -0.8, 0]}>
        <meshStandardMaterial color="#edf2f7" />
      </Box>
    </group>
  );
};

export default RealisticSimulation;
