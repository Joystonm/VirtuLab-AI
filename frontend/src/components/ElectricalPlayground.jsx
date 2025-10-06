import React, { useState, useRef, useEffect } from 'react';

const ElectricalPlayground = ({ onBack }) => {
  const [components, setComponents] = useState([]);
  const [wires, setWires] = useState([]);
  const [mode, setMode] = useState('move'); // 'move', 'wire', 'delete'
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [drawing, setDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState(null);
  const [previewWire, setPreviewWire] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredTerminal, setHoveredTerminal] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);

  const tools = [
    { id: 'battery', icon: '🔋', name: 'Battery' },
    { id: 'bulb', icon: '💡', name: 'Bulb' },
    { id: 'switch', icon: '🔌', name: 'Switch' },
    { id: 'resistor', icon: '➖', name: 'Resistor' },
    { id: 'capacitor', icon: '🔲', name: 'Capacitor' },
    { id: 'diode', icon: '🔺', name: 'Diode' },
    { id: 'led', icon: '🔴', name: 'LED' },
    { id: 'potentiometer', icon: '🎛️', name: 'Potentiometer' },
    { id: 'ground', icon: '⏚', name: 'Ground' },
    { id: 'motor', icon: '⚙️', name: 'DC Motor' },
    { id: 'ammeter', icon: '📏', name: 'Ammeter' },
    { id: 'voltmeter', icon: '📐', name: 'Voltmeter' }
  ];

  const modes = [
    { id: 'move', icon: '✋', name: 'Move' },
    { id: 'wire', icon: '⚡', name: 'Wire' },
    { id: 'delete', icon: '❌', name: 'Delete' }
  ];

  useEffect(() => {
    draw();
    calculateCircuit();
  }, [components, wires, selectedComponent, mousePos, previewWire, hoveredTerminal]);

  const calculateCircuit = () => {
    const battery = components.find(c => c.type === 'battery');
    const voltage = battery ? battery.voltage : 0;
    
    const switches = components.filter(c => c.type === 'switch');
    const circuitClosed = switches.length === 0 || switches.every(s => s.closed);
    
    components.forEach(comp => {
      if (comp.type === 'bulb') {
        if (circuitClosed && voltage > 0) {
          const resistance = comp.resistance || 100;
          const current = voltage / resistance;
          const power = voltage * current;
          
          comp.current = current;
          comp.power = power;
          comp.glowing = power > 0.1;
          comp.fused = power > comp.wattage;
        } else {
          comp.glowing = false;
          comp.current = 0;
          comp.power = 0;
        }
      }
      
      if (comp.type === 'ammeter') {
        comp.reading = circuitClosed && voltage > 0 ? 
          `${(voltage / 100).toFixed(2)}A` : '0.00A';
      }
      
      if (comp.type === 'voltmeter') {
        comp.reading = voltage > 0 ? `${voltage.toFixed(1)}V` : '0.0V';
      }
    });
    
    setComponents([...components]);
  };

  const snapToGrid = (value) => Math.round(value / 20) * 20;

  const getTerminalAt = (x, y) => {
    for (const comp of components) {
      const leftTerminal = { x: comp.x - 25, y: comp.y, compId: comp.id, side: 'left' };
      const rightTerminal = { x: comp.x + 25, y: comp.y, compId: comp.id, side: 'right' };
      
      if (Math.abs(leftTerminal.x - x) < 15 && Math.abs(leftTerminal.y - y) < 15) {
        return leftTerminal;
      }
      if (Math.abs(rightTerminal.x - x) < 15 && Math.abs(rightTerminal.y - y) < 15) {
        return rightTerminal;
      }
    }
    return null;
  };

  const getComponentAt = (x, y) => {
    return components.find(comp => 
      Math.abs(comp.x - x) < 30 && Math.abs(comp.y - y) < 30
    );
  };

  const getWireAt = (x, y) => {
    return wires.find(wire => {
      const dist = Math.abs((wire.y2 - wire.y1) * x - (wire.x2 - wire.x1) * y + wire.x2 * wire.y1 - wire.y2 * wire.x1) / 
                   Math.sqrt((wire.y2 - wire.y1) ** 2 + (wire.x2 - wire.x1) ** 2);
      return dist < 8;
    });
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawGrid(ctx);
    drawCursor(ctx);
    wires.forEach(wire => drawWire(ctx, wire));
    if (previewWire) drawPreviewWire(ctx);
    components.forEach(comp => drawComponent(ctx, comp));
    
    if (selectedComponent) {
      const comp = components.find(c => c.id === selectedComponent);
      if (comp) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.strokeRect(comp.x - 35, comp.y - 35, 70, 70);
      }
    }
  };

  const drawGrid = (ctx) => {
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    for (let x = 0; x < 800; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 500);
      ctx.stroke();
      
      // Draw snap points
      for (let y = 0; y < 500; y += 20) {
        ctx.fillStyle = '#d1d5db';
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
    
    for (let y = 0; y < 500; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(800, y);
      ctx.stroke();
    }
  };

  const drawCursor = (ctx) => {
    const snappedX = snapToGrid(mousePos.x);
    const snappedY = snapToGrid(mousePos.y);
    
    // Blue cursor highlight
    ctx.fillStyle = '#3b82f6';
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(snappedX, snappedY, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  const drawComponent = (ctx, comp) => {
    const { x, y, type } = comp;
    
    ctx.save();
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    
    // Draw terminals with hover highlight
    const leftTerminal = { x: x - 25, y: y };
    const rightTerminal = { x: x + 25, y: y };
    
    [leftTerminal, rightTerminal].forEach(terminal => {
      if (hoveredTerminal && 
          Math.abs(hoveredTerminal.x - terminal.x) < 5 && 
          Math.abs(hoveredTerminal.y - terminal.y) < 5) {
        // Yellow glow for hovered terminal
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(terminal.x, terminal.y, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(terminal.x, terminal.y, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
    
    switch (type) {
      case 'battery':
        drawBattery(ctx, x, y, comp.voltage);
        break;
      case 'bulb':
        drawBulb(ctx, x, y, comp.glowing, comp.fused);
        break;
      case 'switch':
        drawSwitch(ctx, x, y, comp.closed);
        break;
      case 'resistor':
        drawResistor(ctx, x, y, comp.resistance);
        break;
      case 'ammeter':
        drawMeter(ctx, x, y, 'A', comp.reading);
        break;
      case 'voltmeter':
        drawMeter(ctx, x, y, 'V', comp.reading);
        break;
      case 'capacitor':
        drawCapacitor(ctx, x, y, comp.charge);
        break;
      case 'diode':
        drawDiode(ctx, x, y);
        break;
      case 'led':
        drawLED(ctx, x, y, comp.lit);
        break;
      case 'potentiometer':
        drawPotentiometer(ctx, x, y, comp.value);
        break;
      case 'ground':
        drawGround(ctx, x, y);
        break;
      case 'motor':
        drawMotor(ctx, x, y, comp.rotating, comp.speed);
        break;
    }
    
    ctx.restore();
  };

  const drawPreviewWire = (ctx) => {
    if (!previewWire) return;
    
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(previewWire.x1, previewWire.y1);
    ctx.lineTo(previewWire.x2, previewWire.y2);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const drawBattery = (ctx, x, y, voltage) => {
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(x - 15, y - 25, 30, 50);
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(x - 10, y - 30, 20, 10);
    
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('+', x, y - 10);
    ctx.fillText('-', x, y + 15);
    ctx.fillText(`${voltage}V`, x, y + 40);
  };

  const drawBulb = (ctx, x, y, glowing, fused) => {
    if (fused) {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('💥', x, y + 5);
      return;
    }
    
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, 2 * Math.PI);
    ctx.fillStyle = glowing ? '#fbbf24' : '#f3f4f6';
    ctx.fill();
    ctx.stroke();
    
    if (glowing) {
      const gradient = ctx.createRadialGradient(x, y, 10, x, y, 30);
      gradient.addColorStop(0, 'rgba(251, 191, 36, 0.8)');
      gradient.addColorStop(1, 'rgba(251, 191, 36, 0.2)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, 2 * Math.PI);
      ctx.fill();
    }
  };

  const drawSwitch = (ctx, x, y, closed) => {
    ctx.beginPath();
    ctx.moveTo(x - 20, y);
    ctx.lineTo(x + (closed ? 20 : 15), y + (closed ? 0 : -10));
    ctx.strokeStyle = closed ? '#10b981' : '#ef4444';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(x - 20, y, 3, 0, 2 * Math.PI);
    ctx.arc(x + 20, y, 3, 0, 2 * Math.PI);
    ctx.fillStyle = '#374151';
    ctx.fill();
    
    ctx.fillStyle = closed ? '#10b981' : '#ef4444';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(closed ? 'ON' : 'OFF', x, y + 25);
  };

  const drawResistor = (ctx, x, y, resistance) => {
    ctx.beginPath();
    ctx.moveTo(x - 25, y);
    for (let i = 0; i < 6; i++) {
      ctx.lineTo(x - 20 + i * 8, y + (i % 2 ? -10 : 10));
    }
    ctx.lineTo(x + 25, y);
    ctx.stroke();
    
    ctx.fillStyle = '#374151';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${resistance}Ω`, x, y + 25);
  };

  const drawMeter = (ctx, x, y, type, reading) => {
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, 2 * Math.PI);
    ctx.fillStyle = '#f9fafb';
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = '#374151';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(type, x, y - 5);
    if (reading) {
      ctx.font = '10px Arial';
      ctx.fillText(reading, x, y + 10);
    }
  };

  const drawCapacitor = (ctx, x, y, charge) => {
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 5, y - 15);
    ctx.lineTo(x - 5, y + 15);
    ctx.moveTo(x + 5, y - 15);
    ctx.lineTo(x + 5, y + 15);
    ctx.stroke();
    if (charge > 0) {
      ctx.fillStyle = `rgba(59, 130, 246, ${charge})`;
      ctx.fillRect(x - 8, y - 15, 6, 30);
      ctx.fillRect(x + 2, y - 15, 6, 30);
    }
  };

  const drawDiode = (ctx, x, y) => {
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 15, y - 10);
    ctx.lineTo(x, y);
    ctx.lineTo(x - 15, y + 10);
    ctx.closePath();
    ctx.fill();
    ctx.moveTo(x, y - 10);
    ctx.lineTo(x, y + 10);
    ctx.stroke();
  };

  const drawLED = (ctx, x, y, lit) => {
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, 2 * Math.PI);
    ctx.fillStyle = lit ? '#ef4444' : '#f3f4f6';
    ctx.fill();
    ctx.strokeStyle = '#374151';
    ctx.stroke();
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 8, y - 5);
    ctx.lineTo(x, y);
    ctx.lineTo(x - 8, y + 5);
    ctx.moveTo(x, y - 5);
    ctx.lineTo(x, y + 5);
    ctx.stroke();
  };

  const drawPotentiometer = (ctx, x, y, value) => {
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x - 20, y);
    for (let i = -15; i <= 15; i += 5) {
      ctx.lineTo(x + i, y + ((i % 10 === 0) ? -8 : 8));
    }
    ctx.lineTo(x + 20, y);
    ctx.stroke();
    const sliderPos = x - 15 + (value || 0.5) * 30;
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(sliderPos, y - 12, 4, 0, 2 * Math.PI);
    ctx.fill();
  };

  const drawGround = (ctx, x, y) => {
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y - 10);
    ctx.lineTo(x, y);
    ctx.moveTo(x - 15, y);
    ctx.lineTo(x + 15, y);
    ctx.moveTo(x - 10, y + 5);
    ctx.lineTo(x + 10, y + 5);
    ctx.moveTo(x - 5, y + 10);
    ctx.lineTo(x + 5, y + 10);
    ctx.stroke();
  };

  const drawMotor = (ctx, x, y, rotating, speed) => {
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, 2 * Math.PI);
    ctx.fillStyle = '#6b7280';
    ctx.fill();
    ctx.strokeStyle = '#374151';
    ctx.stroke();
    if (rotating) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((Date.now() * (speed || 1)) * 0.01);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(12, 0);
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('M', x, y + 4);
  };

  const drawWire = (ctx, wire) => {
    ctx.beginPath();
    ctx.moveTo(wire.x1, wire.y1);
    ctx.lineTo(wire.x2, wire.y2);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(wire.x1, wire.y1, 4, 0, 2 * Math.PI);
    ctx.arc(wire.x2, wire.y2, 4, 0, 2 * Math.PI);
    ctx.fill();
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePos({ x, y });
    
    // Check for terminal hover
    const terminal = getTerminalAt(x, y);
    setHoveredTerminal(terminal);
    
    if (dragging && mode === 'move') {
      const newX = snapToGrid(x - dragOffset.x);
      const newY = snapToGrid(y - dragOffset.y);
      
      setComponents(components.map(comp =>
        comp.id === dragging.id ? { ...comp, x: newX, y: newY } : comp
      ));
    }
    
    if (drawing && drawStart) {
      const endTerminal = getTerminalAt(x, y);
      if (endTerminal) {
        setPreviewWire({
          x1: drawStart.x,
          y1: drawStart.y,
          x2: endTerminal.x,
          y2: endTerminal.y
        });
      } else {
        setPreviewWire({
          x1: drawStart.x,
          y1: drawStart.y,
          x2: snapToGrid(x),
          y2: snapToGrid(y)
        });
      }
    }
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (mode === 'move') {
      const clickedComponent = getComponentAt(x, y);
      if (clickedComponent) {
        setDragging(clickedComponent);
        setSelectedComponent(clickedComponent.id);
        setDragOffset({ x: x - clickedComponent.x, y: y - clickedComponent.y });
      } else if (selectedTool) {
        addComponent(selectedTool, x, y);
      } else {
        setSelectedComponent(null);
      }
    } else if (mode === 'wire') {
      const terminal = getTerminalAt(x, y);
      if (terminal) {
        setDrawing(true);
        setDrawStart(terminal);
      }
    } else if (mode === 'delete') {
      const clickedComponent = getComponentAt(x, y);
      const clickedWire = getWireAt(x, y);
      
      if (clickedComponent) {
        setComponents(components.filter(c => c.id !== clickedComponent.id));
      } else if (clickedWire) {
        setWires(wires.filter(w => w.id !== clickedWire.id));
      }
    }
  };

  const handleMouseUp = (e) => {
    if (drawing && drawStart) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const endTerminal = getTerminalAt(x, y);
      if (endTerminal && endTerminal.compId !== drawStart.compId) {
        const newWire = {
          id: Date.now(),
          x1: drawStart.x,
          y1: drawStart.y,
          x2: endTerminal.x,
          y2: endTerminal.y
        };
        setWires([...wires, newWire]);
      }
      
      setDrawing(false);
      setDrawStart(null);
      setPreviewWire(null);
    }
    
    setDragging(null);
  };

  const addComponent = (type, x, y) => {
    const newComponent = {
      id: Date.now(),
      type,
      x: snapToGrid(x),
      y: snapToGrid(y),
      voltage: type === 'battery' ? 9 : undefined,
      resistance: type === 'resistor' ? 100 : type === 'bulb' ? 100 : type === 'potentiometer' ? 500 : undefined,
      wattage: type === 'bulb' ? 60 : undefined,
      closed: type === 'switch' ? true : undefined,
      charge: type === 'capacitor' ? 0 : undefined,
      capacitance: type === 'capacitor' ? 100 : undefined,
      value: type === 'potentiometer' ? 0.5 : undefined,
      lit: false,
      rotating: false,
      speed: 0
    };
    
    setComponents([...components, newComponent]);
    setSelectedTool(null);
  };

  const updateComponentValue = (id, property, value) => {
    setComponents(components.map(comp => 
      comp.id === id ? { ...comp, [property]: parseFloat(value) } : comp
    ));
  };

  const toggleSwitch = (id) => {
    setComponents(components.map(comp => 
      comp.id === id ? { ...comp, closed: !comp.closed } : comp
    ));
  };

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Tools Panel */}
      <div className="w-64 bg-white shadow-lg p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">Circuit Tools</h2>
          <button onClick={onBack} className="px-3 py-1 bg-gray-200 rounded">←</button>
        </div>
        
        {/* Mode Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Mode</h3>
          <div className="space-y-1">
            {modes.map(modeOption => (
              <button
                key={modeOption.id}
                onClick={() => setMode(modeOption.id)}
                className={`w-full flex items-center space-x-2 p-2 rounded border-2 transition-colors ${
                  mode === modeOption.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{modeOption.icon}</span>
                <span className="font-medium">{modeOption.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Component Tools */}
        {mode === 'move' && (
          <div className="space-y-2 mb-6">
            <h3 className="text-sm font-medium">Components</h3>
            <div className="max-h-80 overflow-y-auto space-y-2">
              {tools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors ${
                    selectedTool === tool.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">{tool.icon}</span>
                  <span className="font-medium text-sm">{tool.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Component Controls */}
        <div className="space-y-4 max-h-64 overflow-y-auto">
          {components.map(comp => (
            <div key={comp.id} className={`bg-gray-50 p-3 rounded-lg border-2 ${
              selectedComponent === comp.id ? 'border-blue-500' : 'border-transparent'
            }`}>
              <div className="text-sm font-medium mb-2 flex justify-between">
                {comp.type}
                <button 
                  onClick={() => setComponents(components.filter(c => c.id !== comp.id))}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
              
              {comp.type === 'battery' && (
                <div>
                  <label className="text-xs">Voltage</label>
                  <input
                    type="range"
                    min="1"
                    max="24"
                    value={comp.voltage}
                    onChange={(e) => updateComponentValue(comp.id, 'voltage', e.target.value)}
                    className="w-full"
                  />
                  <div className="text-xs text-center">{comp.voltage}V</div>
                </div>
              )}
              
              {comp.type === 'resistor' && (
                <div>
                  <label className="text-xs">Resistance</label>
                  <input
                    type="range"
                    min="1"
                    max="1000"
                    value={comp.resistance}
                    onChange={(e) => updateComponentValue(comp.id, 'resistance', e.target.value)}
                    className="w-full"
                  />
                  <div className="text-xs text-center">{comp.resistance}Ω</div>
                </div>
              )}
              
              {comp.type === 'bulb' && (
                <div>
                  <label className="text-xs">Wattage</label>
                  <select
                    value={comp.wattage}
                    onChange={(e) => updateComponentValue(comp.id, 'wattage', e.target.value)}
                    className="w-full text-xs p-1 border rounded"
                  >
                    <option value={25}>25W</option>
                    <option value={40}>40W</option>
                    <option value={60}>60W</option>
                    <option value={100}>100W</option>
                  </select>
                  {comp.fused && <div className="text-xs text-red-500">💥 FUSED!</div>}
                </div>
              )}
              
              {comp.type === 'switch' && (
                <button
                  onClick={() => toggleSwitch(comp.id)}
                  className={`w-full py-1 px-2 rounded text-xs font-medium ${
                    comp.closed ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}
                >
                  {comp.closed ? 'ON' : 'OFF'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Circuit Board */}
      <div className="flex-1 p-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="bg-white border-2 border-gray-300 rounded-lg"
          style={{ cursor: mode === 'wire' ? 'crosshair' : mode === 'delete' ? 'not-allowed' : 'default' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
        
        <div className="mt-4 text-sm text-gray-600">
          {mode === 'move' && (selectedTool ? `Click to place ${selectedTool}` : 'Drag components • Select tool to add')}
          {mode === 'wire' && 'Click terminal to terminal to draw wires'}
          {mode === 'delete' && 'Click components or wires to delete them'}
        </div>
      </div>
    </div>
  );
};

export default ElectricalPlayground;
