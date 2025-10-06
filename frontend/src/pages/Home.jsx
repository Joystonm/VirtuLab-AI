import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
  const previewCards = [
    {
      title: 'Physics Experiments',
      description: 'Explore 3D physics simulations with realistic mechanics, optics, and motion studies.',
      icon: '⚛️',
      path: '/physics',
      color: 'from-royal-blue to-blue-600',
      features: ['Pendulum Oscillation', 'Spring-Mass Systems', 'Optics & Lenses', 'Newton\'s Laws']
    },
    {
      title: 'Electrical Playground',
      description: 'Build and test electrical circuits with drag-and-drop components and real-time analysis.',
      icon: '⚡',
      path: '/playground',
      color: 'from-yellow-400 to-orange-500',
      features: ['Circuit Builder', 'Component Library', 'Live Simulation', 'Error Detection']
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lab-bg to-blue-50">
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <h1 className="text-6xl md:text-7xl font-bold text-royal-blue mb-6 tracking-wide">
            Virtual Science Lab
          </h1>
          <p className="text-2xl md:text-3xl text-dark-gray mb-6 font-light">
            Explore Real Physics & Electrical Experiments
          </p>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Experience interactive 3D physics simulations and build electrical circuits with real-time feedback. 
            Learn through hands-on experimentation in a realistic virtual laboratory environment.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div className="grid md:grid-cols-2 gap-8 mb-16" variants={itemVariants}>
          {previewCards.map((card, index) => (
            <motion.div
              key={card.title}
              className="group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to={card.path}>
                <div className={`bg-gradient-to-br ${card.color} p-8 rounded-2xl shadow-xl text-white h-full transition-all duration-300 group-hover:shadow-2xl`}>
                  <div className="flex items-center mb-6">
                    <span className="text-4xl mr-4">{card.icon}</span>
                    <h2 className="text-3xl font-bold">{card.title}</h2>
                  </div>
                  
                  <p className="text-lg mb-6 opacity-90">
                    {card.description}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    {card.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center">
                        <span className="w-2 h-2 bg-white rounded-full mr-3 opacity-75"></span>
                        <span className="text-sm opacity-90">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center text-lg font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    <span>Explore</span>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Features Section */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center"
          variants={itemVariants}
        >
          <h2 className="text-4xl font-bold text-dark-gray mb-6">
            Interactive Learning Features
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Experience hands-on learning with real-time simulations, detailed measurements, and comprehensive educational content.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-royal-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-dark-gray mb-2">Real-time Data</h3>
              <p className="text-gray-600">Live measurements and calculations during experiments</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-green rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">💡</span>
              </div>
              <h3 className="text-xl font-semibold text-dark-gray mb-2">Educational Content</h3>
              <p className="text-gray-600">Built-in explanations of physics concepts and principles</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-bright-orange rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">🔍</span>
              </div>
              <h3 className="text-xl font-semibold text-dark-gray mb-2">Interactive Tools</h3>
              <p className="text-gray-600">Manipulate variables and observe immediate results</p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="text-center mt-16 pt-8 border-t border-gray-200"
          variants={itemVariants}
        >
          <p className="text-gray-600 mb-2 text-lg">
            VirtuLab - Interactive Physics & Electrical Simulations
          </p>
          <p className="text-gray-500">
            Learn through hands-on experimentation in a virtual laboratory
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;
