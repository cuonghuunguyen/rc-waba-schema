# Getting Started with FlowBuilder

This guide will help you set up and run the FlowBuilder application.

## Quick Start

### 1. Install Dependencies

```bash
cd schema-editor
pnpm install
```

This will install all required dependencies including:
- React 18.2
- TypeScript 5.2
- Vite 5.0
- TailwindCSS 3.3
- Lucide React (icons)

### 2. Start Development Server

```bash
pnpm dev
```

The application will start at `http://localhost:5173`

### 3. Build for Production

```bash
pnpm build
```

Output will be in the `dist/` directory.

### 4. Preview Production Build

```bash
pnpm preview
```

## Project Structure Overview

```
schema-editor/
├── src/
│   ├── components/          # React components
│   │   ├── ChatSimulator.tsx
│   │   ├── FlowCanvas.tsx
│   │   ├── LocalizedInput.tsx
│   │   └── NodeInspector.tsx
│   ├── constants/           # App constants
│   ├── types/               # TypeScript definitions
│   ├── utils/               # Helper functions
│   ├── App.tsx              # Main component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript config
├── tailwind.config.js       # TailwindCSS config
└── package.json             # Dependencies
```

## Available Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production (includes TypeScript check)
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint to check code quality

## Features

✅ **Visual Flow Editor** - Drag nodes to arrange your bot flow
✅ **Multi-language Support** - Create content in EN, AR, ES, FR
✅ **Live Chat Simulator** - Test your bot in real-time
✅ **Reference Nodes** - Reuse flows by referencing other nodes
✅ **Export/Import** - Save and load bot configurations
✅ **Type Safety** - Full TypeScript support

## Development Tips

1. **Hot Module Replacement**: The dev server supports HMR, so changes appear instantly
2. **Type Checking**: Run `pnpm build` to check for TypeScript errors
3. **Code Quality**: Run `pnpm lint` before committing
4. **Browser DevTools**: React DevTools extension recommended for debugging

## Troubleshooting

### Port Already in Use
If port 5173 is already in use, Vite will automatically try the next available port.

### Build Errors
Make sure you have Node.js 18+ and pnpm 8+ installed:
```bash
node --version  # Should be 18+
pnpm --version  # Should be 8+
```

### Type Errors
Run TypeScript check separately:
```bash
pnpm exec tsc --noEmit
```

## Next Steps

1. Open the application in your browser
2. Click "Add New Node" to create your first conversation node
3. Edit node content in the right panel
4. Click "Simulate" to test your bot flow
5. Click "Export" to save your configuration

Happy building! 🚀
