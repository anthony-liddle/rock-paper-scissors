# Rock Paper Scissors

A rock-paper-scissors game with an attitude — built with React, TypeScript, and the Soundscape Engine.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)

## Features

- Classic rock-paper-scissors gameplay with a narrative twist
- ASCII art animations and CRT-style visual effects
- Dynamic dialogue system with contextual responses
- Integrated soundscape powered by [Soundscape Engine](https://github.com/anthony-liddle/soundscape)
- Illusion engine and tension mechanics
- Player memory and returning player detection
- Mobile-responsive design with touch device support
- Privacy-respecting analytics via PostHog (no cookies, honors Do Not Track)
- Post-ending particle effects

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later)
- [pnpm](https://pnpm.io/) (v10 or later)

### Installation

```bash
# Clone the repository
git clone https://github.com/anthony-liddle/rock-paper-scissors.git
cd rock-paper-scissors

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

### Build

```bash
pnpm build
```

## Project Structure

```
rock-paper-scissors/
├── src/
│   ├── components/     # React components
│   ├── data/           # Dialogue, animations, and soundscape config
│   │   └── animations/ # ASCII art animation sequences
│   ├── engine/         # Game engine (store, RNG, tension, illusions, analytics, etc.)
│   ├── hooks/          # React hooks
│   ├── pages/          # Standalone pages
│   │   └── dev/        # Developer tools (sound, animation, storage)
│   ├── styles/         # CRT and visual effect styles
│   ├── utils/          # Shared utilities (RNG, etc.)
│   ├── App.tsx         # Root application component
│   └── main.tsx        # Entry point and router
├── public/             # Static assets
├── docs/               # Game design documentation
└── index.html          # HTML entry point
```

## Tech Stack

- **React 19** — UI framework
- **TypeScript 5.9** — Type safety
- **Vite 7** — Build tool and dev server
- **Soundscape Engine** — Audio and soundscape management
- **Vitest** — Unit testing
- **PostHog** — Privacy-respecting analytics
- **ESLint** — Code linting

## Contributing

Contributions are welcome! Please read the [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct, development setup, and the pull request process.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
