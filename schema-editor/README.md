# FlowBuilder - Bot Flow Schema Editor

A visual editor for creating and managing WhatsApp bot conversation flows. This application provides an intuitive drag-and-drop interface for designing chatbot interactions with support for multi-language content, reference nodes, and real-time chat simulation.

## Features

- 🎨 **Visual Flow Editor**: Drag-and-drop interface for creating conversation flows
- 🌍 **Multi-language Support**: Create content in multiple languages (English, Arabic, Spanish, French)
- 🔗 **Reference Nodes**: Reuse conversation flows by referencing other nodes
- 💬 **Chat Simulator**: Test your bot flows in real-time
- 📤 **Import/Export**: Save and load your bot configurations as JSON
- 🎯 **Special Actions**: Support for transferring to agents and closing conversations
- 🎨 **Modern UI**: Built with React, TypeScript, and TailwindCSS

## Project Structure

```
schema-editor/
├── src/
│   ├── components/          # React components
│   │   ├── ChatSimulator.tsx    # Chat preview component
│   │   ├── FlowCanvas.tsx       # Visual graph editor
│   │   ├── LocalizedInput.tsx   # Multi-language input field
│   │   └── NodeInspector.tsx    # Node editing panel
│   ├── constants/           # Application constants
│   │   └── index.ts
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   └── helpers.ts
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── index.html               # HTML entry point
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite build configuration
├── tailwind.config.js       # TailwindCSS configuration
└── postcss.config.js        # PostCSS configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 8+

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Start the development server:
```bash
pnpm dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
pnpm build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
pnpm preview
```

## Usage

### Creating a Flow

1. Click "Add New Node" to create a new conversation node
2. Select the node from the left sidebar or click it on the canvas
3. Edit the node content in the right panel:
   - Add message text (supports multi-language)
   - Add images
   - Add buttons for user interactions
   - Configure special actions (transfer, close)

### Node Types

- **Standard Node**: Contains conversation responses with text, images, and buttons
- **Reference Node**: Points to another node to reuse its content
- **System Nodes**: Pre-defined nodes (greeting, selectLanguage, wrongSelection, technicalError)

### Testing Your Flow

Click the "Simulate" button to open the chat simulator and test your bot flow in real-time.

### Exporting Your Flow

Click "Export" to download your bot configuration as a JSON file that can be used in your bot implementation.

## Technology Stack

- **React 18**: UI library
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **TailwindCSS**: Utility-first CSS framework
- **Lucide React**: Icon library

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
