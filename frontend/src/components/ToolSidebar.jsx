import React from 'react';
import { useLab } from '../context/LabContext';

const ToolSidebar = ({ activeTab }) => {
  const { selectedTool, setSelectedTool } = useLab();

  const physicsTools = [
    { id: 'battery', name: 'Battery', icon: '🔋' },
    { id: 'wire', name: 'Wire', icon: '🔌' },
    { id: 'bulb', name: 'Light Bulb', icon: '💡' },
    { id: 'switch', name: 'Switch', icon: '🔘' },
    { id: 'resistor', name: 'Resistor', icon: '⚡' }
  ];

  const chemistryTools = [
    { id: 'beaker', name: 'Beaker', icon: '🧪' },
    { id: 'acid', name: 'HCl Acid', icon: '🟡' },
    { id: 'base', name: 'NaOH Base', icon: '🔵' },
    { id: 'indicator', name: 'pH Indicator', icon: '🌈' },
    { id: 'thermometer', name: 'Thermometer', icon: '🌡️' }
  ];

  const tools = activeTab === 'physics' ? physicsTools : chemistryTools;

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {activeTab === 'physics' ? 'Physics Tools' : 'Chemistry Tools'}
      </h2>
      
      <div className="space-y-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setSelectedTool(tool.id)}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
              selectedTool === tool.id
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-2xl">{tool.icon}</span>
            <span className="font-medium">{tool.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ToolSidebar;
