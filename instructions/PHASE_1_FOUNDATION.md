🎯 Phase 1: Foundation & Architecture (Days 1-3)
Duration: 2-3 days
Commits: 2 required
Output: Complete project foundation with latest 2025 tech stack

📦 LATEST TECHNOLOGY STACK (December 2025)
Technology	Latest Version	Notes
Next.js	16.1	Turbopack caching, bundle analyzer 
​
React	19.2.1	Latest stable release 
​
TypeScript	5.5+	Strict mode, ES2025 target 
​
Zustand	5.x	React 18+ native support 
​
Pixi.js	8.15.0-rc	Latest RC (stable for production) [mcp]
Xterm.js	6.0.0	Synchronized output, ligatures [mcp]
Jest	30.0.0	Latest major release 
​
Playwright	1.57.0	Latest stable 
​
🚀 Step-by-Step Implementation Checklist
✅ 1. Project Initialization (1 hour)
bash

do this installation in curerent folder where you want the project to be created that is root of this repo 
# Create Next.js 16.1 project with TypeScript
npx create-next-app@16.1 dsa-visualizer --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd dsa-visualizer

# Install LATEST core dependencies
npm install react@19.2.1 react-dom@19.2.1
npm install next@16.1
npm install typescript@5.5 @types/node@22 @types/react@19 @types/react-dom@19
npm install zustand@5

# Install visualization & terminal (latest)
npm install pixi.js@8.15.0-rc xterm@6.0.0 @xterm/addon-fit@6.0.0

# Install testing (latest)
npm install -D jest@30 @types/jest@30 ts-jest@30 @playwright/test@1.57 vitest@2

# Install dev tools
npm install -D @types/node tailwindcss postcss autoprefixer eslint-config-next@16
Success Criteria:

 package.json shows all latest versions above

 npm run dev starts without errors

 TypeScript strict mode enabled

✅ 2. Complete Folder Structure (30 min)
Create this exact structure:

text
src/
├── app/                    # Next.js 16.1 app router
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── favicon.ico
├── components/             # React 19 components
│   ├── ui/                # Reusable UI primitives
│   ├── canvas/            # Pixi.js 8.15 components
│   ├── terminal/          # Xterm.js 6.0 components
│   └── layout/            # Layout components
├── stores/                # Zustand 5 stores
│   ├── app.store.ts
│   ├── canvas.store.ts
│   └── terminal.store.ts
├── lib/                   # Utilities
│   ├── utils.ts
│   ├── cli-parser.ts
│   └── animations.ts
├── types/                 # TypeScript 5.5 types
│   ├── app.d.ts
│   ├── canvas.d.ts
│   └── terminal.d.ts
├── hooks/                 # React 19 hooks
│   ├── useCanvas.ts
│   ├── useTerminal.ts
│   └── useAlgorithms.ts
└── constants/             # Design tokens
    ├── design.ts
    ├── algorithms.ts
    └── cli-commands.ts
Commands:

bash
mkdir -p src/{app,components/{ui,canvas,terminal,layout},stores,lib,types,hooks,constants}
touch src/app/{layout.tsx,page.tsx,globals.css}
# ... (create all files)
Success Criteria:

 40+ directories/files created exactly as shown

 No TypeScript errors on empty files

✅ 3. Moonlight Hacker Design System (1 hour)
src/constants/design.ts:

typescript
// Moonlight Hacker Theme - No gradients, flat design
export const design = {
  colors: {
    bg: '#0a0a0a',      // Deep black
    bgSecondary: '#1a1a1a',
    surface: '#252525',
    text: '#e0e0e0',
    textSecondary: '#a0a0a0',
    cyan: '#00d4ff',     // Primary accent
    pink: '#ff00ff',     // Secondary accent
    purple: '#aa00ff',   // Tertiary accent
    green: '#00ff88',    // Success
    red: '#ff4444',      // Error
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  font: {
    mono: '"JetBrains Mono", "Fira Code", monospace',
    size: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '24px',
    },
  },
  borderRadius: '4px',
  shadows: {
    sm: '0 2px 8px rgba(0,212,255,0.1)',
    md: '0 4px 16px rgba(0,212,255,0.15)',
  },
} as const;
src/app/globals.css:

css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
  --bg: 15 15 15;
  --bg-secondary: 25 25 25;
  --surface: 37 37 37;
  --text: 224 224 224;
  --text-secondary: 160 160 160;
  --cyan: 0 212 255;
  --pink: 255 0 255;
  --purple: 170 0 255;
}

* {
  font-family: 'JetBrains Mono', monospace;
}

body {
  @apply bg-[#0a0a0a] text-[#e0e0e0] antialiased;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.hacker-glow {
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
}

.glitch {
  animation: glitch 0.3s infinite;
}

@keyframes glitch {
  0%, 100% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
}
Success Criteria:

 CSS variables match exact hex colors

 JetBrains Mono font loaded

 No gradients used

 Flat design with subtle glow effects

✅ 4. Zustand 5 Stores (1.5 hours)
src/stores/app.store.ts:

typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  activeAlgorithm: string;
  arraySize: number;
  animationSpeed: number;
  theme: 'moonlight' | 'matrix';
  isPlaying: boolean;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeAlgorithm: 'bubble-sort',
      arraySize: 100,
      animationSpeed: 1,
      theme: 'moonlight',
      isPlaying: false,
      setActiveAlgorithm: (algo: string) => set({ activeAlgorithm: algo }),
      setArraySize: (size: number) => set({ arraySize: size }),
      setAnimationSpeed: (speed: number) => set({ animationSpeed: speed }),
      togglePlay: () => set({ isPlaying: !get().isPlaying }),
      setTheme: (theme: AppState['theme']) => set({ theme }),
    }),
    {
      name: 'dsa-visualizer-app',
    }
  )
);
Success Criteria:

 Zustand 5.x syntax (no use-sync-external-store)

 TypeScript strict typing

 Persistence enabled

 3 stores created (app, canvas, terminal)

✅ 5. Base Layout Component (1 hour)
src/components/layout/MainLayout.tsx:

typescript
'use client';

import { useEffect } from 'react';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Preload fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0a0a0a] overflow-hidden">
      {/* Top Bar */}
      <header className="h-12 bg-[#1a1a1a] border-b border-[#00d4ff]/20 flex items-center px-6">
        <h1 className="text-xl font-semibold text-cyan-400 hacker-glow">
          DSA Visualizer
        </h1>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - File Explorer */}
        <aside className="w-80 bg-[#252525] border-r border-[#00d4ff]/10 p-4 overflow-auto">
          File Explorer
        </aside>
        
        {/* Center Canvas */}
        <main className="flex-1 bg-[#0a0a0a] relative">
          {children}
        </main>
        
        {/* Right Sidebar - Tools */}
        <aside className="w-96 bg-[#1a1a1a] border-l border-[#00d4ff]/10 p-4 overflow-auto">
          Tools & Settings
        </aside>
      </div>
      
      {/* Bottom Terminal */}
      <div className="h-48 bg-black/90 border-t border-[#ff00ff]/20 relative">
        Terminal
      </div>
    </div>
  );
}
Success Criteria:

 4-section layout (top bar, left sidebar, center canvas, right sidebar, bottom terminal)

 Exact color scheme from design system

 Responsive flex layout

 Overflow hidden on main container

✅ 6. First Git Commits (15 min)
bash
# Commit 1: Project setup
git add .
git commit -m "feat: initialize Next.js 16.1 + TypeScript 5.5 project

- Latest 2025 tech stack (Next.js 16.1, React 19.2.1, TS 5.5)
- Complete folder structure (40+ directories)
- Moonlight hacker design system
- Tailwind CSS + JetBrains Mono
- Environment configured"

# Commit 2: Base components
git add .
git commit -m "feat: base layout + Zustand 5 stores

- MainLayout with 4-section hacker UI
- 3 Zustand 5 stores (app, canvas, terminal)
- Design system fully implemented
- Responsive layout with exact specs
- Ready for Phase 2 terminal implementation"
Success Criteria:

 Exactly 2 commits with specified messages

 git log --oneline shows both commits

 git status is clean

✅ PHASE 1 SUCCESS CRITERIA (Verify Before Moving to Phase 2)
Technical Requirements ✅
 Next.js 16.1 running (npm run dev)

 React 19.2.1 + TypeScript 5.5 strict mode

 40+ directories match exact structure

 Zustand 5.x stores with persistence

 Design system: exact hex colors, no gradients

 MainLayout: 4 sections, responsive flex

 JetBrains Mono font loaded

 Tailwind CSS configured

Visual Requirements ✅
 Background: #0a0a0a (deep black)

 Text: #e0e0e0 with cyan #00d4ff accents

 Flat design, subtle glow effects only

 5 layout sections visible

 Hacker aesthetic (professional, no distractions)

Code Quality ✅
 No TypeScript errors (npm run type-check)

 No ESLint errors (npm run lint)

 Build succeeds (npm run build)

 2 Git commits completed

 package.json has all latest versions

Performance ✅
 Page loads <1s

 No layout shift

 Smooth scrolling in sidebars

 Memory usage <50MB idle

🚨 BLOCKERS TO RESOLVE
If any success criteria fail:

TypeScript errors: Check tsconfig.json strict mode

Next.js build fails: Verify Next.js 16.1 compatibility

Design not matching: Check CSS variables exact hex values

Layout broken: Verify flexbox overflow settings

Dependencies fail: Run npm install with exact versions above

📦 Commit Summary
text
feat: initialize Next.js 16.1 + TypeScript 5.5 project (Commit 1/2)
feat: base layout + Zustand 5 stores (Commit 2/2)
Total Phase 1 Commits: 2/2 ✅