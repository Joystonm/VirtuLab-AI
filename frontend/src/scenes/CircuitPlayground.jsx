import React, { useRef, useEffect, useState } from 'react';
import { useLab } from '../context/LabContext';
import { useAIHelper } from '../hooks/useAIHelper';

const CircuitPlayground = () => {
  const canvasRef = useRef(null);
  const [components, setComponents] = useState([]);
  const [wires, setWires] = useState([]);
  const [isDrawingWire, setIsDrawingWire] = useState(false);
  const [wireStart, setWireStart] = useState(null);
  const { selectedTool, logExperiment } = useLab();
  const { getInstantFeedback } = useAIHelper();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    drawCanvas(ctx);
  }, [components, wires]);

  const drawCanvas = (ctx) => {
    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw grid
    drawGrid(ctx);
    
    // Draw wires
    wires.forEach(wire => drawWire(ctx, wire));
    
    // Draw components
    components.forEach(component => drawComponent(ctx, component));
  };

  const drawGrid = (ctx) => {
    const gridSize = 20;
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    for (let x = 0; x < ctx.canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, ctx.canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < ctx.canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(ctx.canvas.width, y);
      ctx.stroke();
    }
  };

  const drawComponent = (ctx, component) => {
    const { x, y, type } = component;
    
    ctx.save();
    ctx.translate(x, y);
    
    switch (type) {
      case 'battery':
        // Draw battery symbol
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-20, -10, 40, 20);
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🔋', 0, 5);
        break;
        
      case 'bulb':
        // Draw bulb
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, 2 * Math.PI);
        ctx.fillStyle = component.lit ? '#fef3c7' : '#f3f4f6';
        ctx.fill();
        ctx.strokeStyle = '#374151';
        ctx.stroke();
        ctx.fillStyle = '#000';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('💡', 0, 5);
        break;
        
      case 'resistor':
        // Draw resistor zigzag
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-20, 0);
        for (let i = -15; i <= 15; i += 5) {
          ctx.lineTo(i, (i % 10 === 0) ? -8 : 8);
        }
        ctx.lineTo(20, 0);
        ctx.stroke();
        break;
        
      case 'switch':
        // Draw switch
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-15, 0);
        ctx.lineTo(component.closed ? 15 : 10, component.closed ? 0 : -8);
        ctx.stroke();
        // Draw connection points
        ctx.fillStyle = '#374151';
        ctx.beginPath();
        ctx.arc(-15, 0, 3, 0, 2 * Math.PI);
        ctx.arc(15, 0, 3, 0, 2 * Math.PI);
        ctx.fill();
        break;
    }
    
    ctx.restore();
  };

  const drawWire = (ctx, wire) => {
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(wire.start.x, wire.start.y);
    ctx.lineTo(wire.end.x, wire.end.y);
    ctx.stroke();
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Snap to grid
    const gridSize = 20;
    const snappedX = Math.round(x / gridSize) * gridSize;
    const snappedY = Math.round(y / gridSize) * gridSize;

    if (selectedTool === 'wire') {
      handleWireDrawing(snappedX, snappedY);
    } else if (selectedTool && selectedTool !== 'wire') {
      addComponent(snappedX, snappedY, selectedTool);
    }
  };

  const handleWireDrawing = (x, y) => {
    if (!isDrawingWire) {
      setIsDrawingWire(true);
      setWireStart({ x, y });
    } else {
      const newWire = {
        id: Date.now(),
        start: wireStart,
        end: { x, y }
      };
      setWires(prev => [...prev, newWire]);
      setIsDrawingWire(false);
      setWireStart(null);
      
      // Log wire connection
      logExperiment('wire_connected', { from: wireStart, to: { x, y } });
      analyzeCircuit([...components], [...wires, newWire]);
    }
  };

  const addComponent = (x, y, type) => {
    const newComponent = {
      id: Date.now(),
      x,
      y,
      type,
      lit: false,
      closed: type === 'switch' ? true : undefined
    };
    
    setComponents(prev => [...prev, newComponent]);
    logExperiment('component_added', { type, position: { x, y } });
  };

  const analyzeCircuit = (comps, wrs) => {
    const batteries = comps.filter(c => c.type === 'battery');
    const bulbs = comps.filter(c => c.type === 'bulb');
    
    if (batteries.length > 0 && bulbs.length > 0 && wrs.length >= 2) {
      // Simple circuit analysis - mark bulbs as lit
      setComponents(prev => prev.map(comp => 
        comp.type === 'bulb' ? { ...comp, lit: true } : comp
      ));
      getInstantFeedback('circuit_complete', { components: comps.length });
    } else if (batteries.length > 1 && wrs.length < 2) {
      getInstantFeedback('short_circuit', { batteries: batteries.length });
    }
  };

  return (
    <div className="h-full bg-white relative">
      {/* Circuit Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-crosshair"
        style={{ background: 'linear-gradient(to bottom, #f0f9ff, #e0f2fe)' }}
      />
      
      {/* Instructions */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-sm">
        <h3 className="font-semibold text-gray-800 mb-2">⚡ Circuit Builder</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Select components from the sidebar</p>
          <p>• Click on canvas to place them</p>
          <p>• Select "Wire" and click two points to connect</p>
          <p>• Build complete circuits to light up bulbs!</p>
        </div>
      </div>

      {/* Wire Drawing Indicator */}
      {isDrawingWire && (
        <div className="absolute top-4 right-4 bg-amber-100 border border-amber-300 rounded-lg p-3">
          <p className="text-amber-800 font-medium">🔌 Click to finish wire connection</p>
        </div>
      )}
    </div>
  );
};

export default CircuitPlayground;
