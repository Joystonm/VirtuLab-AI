# VirtuLab - Virtual Physics Lab

VirtuLab is a browser-based virtual physics and electrical lab that allows students to perform realistic experiments and simulations in an interactive environment.

## 🚀 Features

- **3D Motion & Optics Lab** - Simulate pendulums, springs, lenses, and Newton's laws
- **2D Circuit Builder** - Drag & drop electrical components with precise wire drawing
- **Interactive Physics Simulations** - Explore mechanics, oscillations, and optics
- **Real-time Measurements** - Live data collection and analysis
- **Educational Content** - Built-in explanations of physics concepts

## 🖥️ Tech Stack

- **Frontend**: React + Three.js + Tailwind CSS
- **3D Physics**: React Three Fiber + Cannon.js
- **2D Circuit Builder**: HTML5 Canvas with custom wire drawing
- **Backend**: Node.js + Express + Appwrite

## 🎯 Color Palette

- **Primary**: #1E40AF (Deep Blue - science & trust)
- **Secondary**: #0EA5E9 (Cyan - interactive/modern)  
- **Accent**: #F59E0B (Amber - warnings/errors)
- **Background**: #F9FAFB (Light Gray - clean lab)

## 🚀 Quick Start

```bash
# Install all dependencies
npm run install:all

# Start development servers
npm run dev
```

## 📁 Project Structure

```
├── frontend/          # React + Three.js client
│   ├── src/
│   │   ├── components/    # UI components & tools
│   │   ├── scenes/        # 3D physics lab & 2D circuit playground
│   │   ├── hooks/         # Custom React hooks
│   │   └── context/       # Global state management
├── backend/           # Node.js + Express backend
│   ├── src/
│   │   ├── api/           # REST API routes
│   │   ├── services/      # Application services
│   │   └── models/        # Data models
└── docs/              # Documentation
```

## 🔬 Physics Experiments

### 3D Motion Lab
- Pendulum oscillations with energy conversion
- Spring-mass systems following Hooke's Law
- Inclined plane motion and friction
- Lens focusing and optics principles

### 2D Circuit Builder
- Complete circuit simulation
- Component behavior visualization
- Real-time electrical measurements
- Interactive learning tools

---

**VirtuLab = Interactive Physics & Electrical Simulations for Education**
