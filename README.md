# VirtuLab AI - Virtual Physics Lab with AI Tutor

Interactive 3D physics lab with 2D circuit builder, powered by AI tutoring capabilities using Groq and Tavily.

## 🚀 Features

- **3D Motion & Optics Lab** - Simulate pendulums, springs, lenses, and Newton's laws
- **2D Circuit Builder** - Drag & drop electrical components with precise wire drawing
- **Real-time AI Tutoring** - Instant feedback and explanations powered by Groq + Tavily
- **Interactive Physics Simulations** - Explore mechanics, oscillations, and optics
- **Circuit Analysis** - AI detects errors and explains electrical concepts

## 🖥️ Tech Stack

- **Frontend**: React + Three.js + Tailwind CSS
- **3D Physics**: React Three Fiber + Cannon.js
- **2D Circuit Builder**: HTML5 Canvas with custom wire drawing
- **AI Tutor**: Groq LLM + Tavily fact-checking
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
│   │   ├── services/      # Groq & Tavily integrations
│   │   └── models/        # Data models
└── docs/              # Documentation
```

## 🤖 AI Features

- **Instant Feedback** - Real-time analysis of experiments
- **Concept Explanations** - Why physics phenomena occur
- **Error Detection** - Identifies circuit problems and safety issues
- **Challenge Mode** - AI suggests new experiments to try

## 🔬 Physics Experiments

### 3D Motion Lab
- Pendulum oscillations with energy conversion
- Spring-mass systems following Hooke's Law
- Inclined plane motion and friction
- Lens focusing and optics principles

### 2D Circuit Builder
- Complete circuit analysis
- Component behavior explanation
- Short circuit detection
- Electrical safety guidance

---

**VirtuLab AI = PhET Simulations + AI Tutor → Free, Interactive, AI-powered Physics Lab**
