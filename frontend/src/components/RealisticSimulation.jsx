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
  const [state, setState] = useState({
    x: parameters.initialDisplacement || 0.5,
    v: 0,
    time: 0
  });
  
  const m = parameters.mass || 1.0;
  const k = parameters.springConstant || 10.0;
  const b = parameters.damping || 0.2;
  const equilibrium = 1.0;
  
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
      
      massRef.current.position.y = equilibrium + newX;
      
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

  return (
    <group>
      <Box args={[2, 0.3, 2]} position={[0, -2, 0]}>
        <meshStandardMaterial color="#64748b" />
      </Box>
      {Array.from({ length: 8 }, (_, i) => (
        <Cylinder key={i} args={[0.15, 0.15, 0.1]} position={[0, -1.5 + i * 0.15, 0]}>
          <meshStandardMaterial color="#10b981" />
        </Cylinder>
      ))}
      <Box ref={massRef} args={[0.6, 0.6, 0.6]} position={[0, 1, 0]}>
        <meshStandardMaterial color="#0ea5e9" />
      </Box>
    </group>
  );
};

// Real Physics Inclined Plane
const InclineExperiment = ({ isPlaying, onMeasurement, onPromptChange, parameters }) => {
  const blockRef = useRef();
  const planeRef = useRef();
  const gravityArrowRef = useRef();
  const normalArrowRef = useRef();
  const frictionArrowRef = useRef();
  const netArrowRef = useRef();
  
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
      const blockY = 0.15 + newPosition * Math.sin(theta);
      
      blockRef.current.position.set(blockX, blockY, 0);
      
      // Update force arrows
      updateForceArrows(blockX, blockY, F_gravity, F_normal, F_friction, F_net, theta);
      
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
  
  const updateForceArrows = (blockX, blockY, Fg, Fn, Ff, Fnet, angle) => {
    const scale = 0.002; // Arrow scaling
    
    // Gravity arrow (red, downward)
    if (gravityArrowRef.current) {
      gravityArrowRef.current.position.set(blockX + 0.3, blockY, 0);
      gravityArrowRef.current.scale.y = Fg * scale;
    }
    
    // Normal arrow (green, perpendicular to plane)
    if (normalArrowRef.current) {
      normalArrowRef.current.position.set(blockX, blockY + 0.3, 0);
      normalArrowRef.current.rotation.z = Math.PI/2 - angle;
      normalArrowRef.current.scale.y = Fn * scale;
    }
    
    // Friction arrow (yellow, up the plane)
    if (frictionArrowRef.current) {
      frictionArrowRef.current.position.set(blockX - 0.3, blockY, 0);
      frictionArrowRef.current.rotation.z = angle;
      frictionArrowRef.current.scale.y = Ff * scale;
    }
    
    // Net force arrow (blue, down the plane)
    if (netArrowRef.current && Fnet > 0) {
      netArrowRef.current.position.set(blockX, blockY - 0.3, 0);
      netArrowRef.current.rotation.z = -angle;
      netArrowRef.current.scale.y = Fnet * scale;
      netArrowRef.current.visible = true;
    } else if (netArrowRef.current) {
      netArrowRef.current.visible = false;
    }
  };

  return (
    <group>
      {/* Inclined Plane with grid texture */}
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
        args={[0.3, 0.3, 0.3]} 
        position={[-planeLength/2, 0.15, 0]}
      >
        <meshStandardMaterial color="#0ea5e9" />
      </Box>
      
      {/* Force Arrows */}
      {/* Gravity (Red) */}
      <Cylinder 
        ref={gravityArrowRef}
        args={[0.02, 0.02, 1]} 
        position={[0, 0, 0]}
      >
        <meshStandardMaterial color="#ef4444" />
      </Cylinder>
      
      {/* Normal (Green) */}
      <Cylinder 
        ref={normalArrowRef}
        args={[0.02, 0.02, 1]} 
        position={[0, 0, 0]}
      >
        <meshStandardMaterial color="#22c55e" />
      </Cylinder>
      
      {/* Friction (Yellow) */}
      <Cylinder 
        ref={frictionArrowRef}
        args={[0.02, 0.02, 1]} 
        position={[0, 0, 0]}
      >
        <meshStandardMaterial color="#eab308" />
      </Cylinder>
      
      {/* Net Force (Blue) */}
      <Cylinder 
        ref={netArrowRef}
        args={[0.02, 0.02, 1]} 
        position={[0, 0, 0]}
      >
        <meshStandardMaterial color="#3b82f6" />
      </Cylinder>
      
      {/* Ground */}
      <Box args={[8, 0.05, 3]} position={[0, -0.8, 0]}>
        <meshStandardMaterial color="#64748b" />
      </Box>
    </group>
  );
};

// Real Physics Newton's Laws
const NewtonExperiment = ({ isPlaying, onMeasurement, onPromptChange, parameters }) => {
  const cartRef = useRef();
  const [state, setState] = useState({
    x: 0,
    v: 0,
    time: 0
  });
  
  const m = parameters.mass || 2.0;
  const F_applied = parameters.force || 5.0;
  
  useFrame((_, delta) => {
    if (!isPlaying || !cartRef.current) return;
    
    setState(prev => {
      const dt = delta;
      
      // Newton's Second Law: F = ma
      const acceleration = F_applied / m;
      const newV = prev.v + acceleration * dt;
      const newX = prev.x + newV * dt;
      const newTime = prev.time + dt;
      
      // Reset if cart goes too far
      const resetX = Math.abs(newX) > 3 ? 0 : newX;
      const resetV = Math.abs(newX) > 3 ? 0 : newV;
      
      cartRef.current.position.x = resetX;
      
      onMeasurement({
        'Applied Force (N)': F_applied.toFixed(1),
        'Mass (kg)': m.toFixed(1),
        'Acceleration (m/s²)': acceleration.toFixed(2),
        'Velocity (m/s)': resetV.toFixed(2),
        'Position (m)': resetX.toFixed(2),
        'Momentum (kg⋅m/s)': (m * resetV).toFixed(2)
      });
      
      return { x: resetX, v: resetV, time: newTime };
    });
  });

  return (
    <group>
      <Box args={[6, 0.1, 0.4]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#64748b" />
      </Box>
      <Box ref={cartRef} args={[0.6, 0.3, 0.5]} position={[0, 0.4, 0]}>
        <meshStandardMaterial color="#3b82f6" />
      </Box>
    </group>
  );
};

// Real Optics - Convex Lens
const LensExperiment = ({ isPlaying, onMeasurement, onPromptChange, parameters }) => {
  const objectDistance = parameters.objectDistance || 30;
  const focalLength = parameters.focalLength || 15;
  
  // Lens equation: 1/f = 1/do + 1/di
  const imageDistance = (focalLength * objectDistance) / (objectDistance - focalLength);
  const magnification = -imageDistance / objectDistance;
  const imageHeight = Math.abs(magnification) * 2; // Assuming object height = 2
  
  onMeasurement({
    'Object Distance (cm)': objectDistance.toFixed(1),
    'Focal Length (cm)': focalLength.toFixed(1),
    'Image Distance (cm)': imageDistance.toFixed(1),
    'Magnification': magnification.toFixed(2),
    'Image Height (cm)': imageHeight.toFixed(1),
    'Image Type': imageDistance > 0 ? 'Real, Inverted' : 'Virtual, Upright'
  });

  return (
    <group>
      <Box args={[8, 0.1, 0.3]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#64748b" />
      </Box>
      <Cylinder args={[0.8, 0.8, 0.05]} rotation={[Math.PI/2, 0, 0]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#fbbf24" transparent opacity={0.8} />
      </Cylinder>
      {/* Object */}
      <Box args={[0.1, 2, 0.1]} position={[-objectDistance/10, 1, 0]}>
        <meshStandardMaterial color="#ef4444" />
      </Box>
      {/* Image */}
      <Box args={[0.1, imageHeight/10, 0.1]} position={[imageDistance/10, imageHeight > 0 ? 1 : -1, 0]}>
        <meshStandardMaterial color="#22c55e" />
      </Box>
    </group>
  );
};

// Real Optics - Concave Mirror
const MirrorExperiment = ({ isPlaying, onMeasurement, onPromptChange, parameters }) => {
  const objectDistance = parameters.objectDistance || 30;
  const focalLength = parameters.focalLength || 20;
  
  // Mirror equation: 1/f = 1/do + 1/di
  const imageDistance = (focalLength * objectDistance) / (objectDistance - focalLength);
  const magnification = -imageDistance / objectDistance;
  const imageHeight = Math.abs(magnification) * 2;
  
  onMeasurement({
    'Object Distance (cm)': objectDistance.toFixed(1),
    'Focal Length (cm)': focalLength.toFixed(1),
    'Image Distance (cm)': imageDistance.toFixed(1),
    'Magnification': magnification.toFixed(2),
    'Image Height (cm)': imageHeight.toFixed(1),
    'Image Type': imageDistance > 0 ? 'Real, Inverted' : 'Virtual, Upright'
  });

  return (
    <group>
      <Box args={[8, 0.1, 0.3]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#64748b" />
      </Box>
      <Sphere args={[1.2]} position={[0, 0.6, 0]} scale={[0.05, 1, 1]}>
        <meshStandardMaterial color="#e5e7eb" metalness={0.9} />
      </Sphere>
      {/* Object */}
      <Box args={[0.1, 2, 0.1]} position={[-objectDistance/10, 1, 0]}>
        <meshStandardMaterial color="#ef4444" />
      </Box>
      {/* Image */}
      <Box args={[0.1, imageHeight/10, 0.1]} position={[imageDistance/10, imageHeight > 0 ? 1 : -1, 0]}>
        <meshStandardMaterial color="#22c55e" />
      </Box>
    </group>
  );
};

export default RealisticSimulation;
