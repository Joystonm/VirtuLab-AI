import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import PhysicsLab from '../scenes/PhysicsLab';
import ChemistryLab from '../scenes/ChemistryLab';
import ToolSidebar from './ToolSidebar';
import AIChatPanel from './AIChatPanel';

const MainLab = () => {
  const [activeTab, setActiveTab] = useState('physics');

  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Tools */}
      <ToolSidebar activeTab={activeTab} />
      
      {/* Center - 3D Lab Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('physics')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'physics'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Physics Lab
            </button>
            <button
              onClick={() => setActiveTab('chemistry')}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeTab === 'chemistry'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Chemistry Lab
            </button>
          </div>
        </div>

        {/* 3D Canvas */}
        <div className="flex-1 bg-gray-100">
          <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
            
            {activeTab === 'physics' && <PhysicsLab />}
            {activeTab === 'chemistry' && <ChemistryLab />}
          </Canvas>
        </div>
      </div>

      {/* Right Sidebar - AI Tutor */}
      <AIChatPanel />
    </div>
  );
};

export default MainLab;
