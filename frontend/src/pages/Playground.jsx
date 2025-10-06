import React from 'react';
import { motion } from 'framer-motion';
import ElectricalPlayground from '../components/ElectricalPlayground';

const Playground = () => {
  return (
    <motion.div
      className="h-screen bg-lab-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-royal-blue flex items-center">
            <span className="text-2xl mr-3">⚡</span>
            Electrical Playground
          </h1>
          <p className="text-gray-600 mt-1">
            Build and test electrical circuits with drag-and-drop components
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="h-full">
        <ElectricalPlayground />
      </div>
    </motion.div>
  );
};

export default Playground;
