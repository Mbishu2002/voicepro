# VoicePro

A powerful desktop application for voice synthesis and manipulation, built with Next.js, Electron, and Python.

## Features

- Text-to-Speech synthesis with multiple voice models
- Voice emotion control and manipulation
- Project management system
- History tracking
- Cross-platform support (Windows, macOS, Linux)
- Dark/Light mode support
- Real-time audio preview
- Custom voice settings

## Tech Stack

- **Frontend**: Next.js, TypeScript, TailwindCSS, Shadcn/ui
- **Desktop**: Electron
- **Backend**: Python
- **Voice Processing**: [Zonos](https://github.com/Zyphra/Zonos)

## Prerequisites

- Node.js 20.x or later
- Python 3.10 or later
- Git

## Installation

1. Clone the repository with submodules:
```bash
git clone --recurse-submodules https://github.com/Mbishu2002/voicepro.git
cd voicepro
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Install Python dependencies:
```bash
cd server
pip install -r requirements.txt
```

## Development

1. Start the development server:
```bash
npm run dev
```

2. In a separate terminal, start the Electron app:
```bash
npm run electron-dev
```

## Building

To build the application for your platform:
```bash
npm run build
npm run electron-build
```

The built application will be available in the `dist` directory.

## Project Structure

```
voicepro/
├── app/                    # Next.js pages and routes
├── components/            # React components
├── electron/              # Electron main and preload scripts
├── server/               # Python backend server
├── lib/                  # Shared utilities and services
├── public/              # Static assets
└── Zonos/               # Zonos submodule
```

## Automated Workflows

### Dependency Updates
- Automatically checks for updates daily
- Creates pull requests for new dependencies
- Can be manually triggered from GitHub Actions

### Release Pipeline
- Builds executables for Windows, macOS, and Linux
- Triggered on version tags (v*)
- Creates GitHub releases with artifacts
- Generates release notes automatically

## Updating Zonos

The Zonos module is included as a git submodule. To update to the latest version:

```bash
git submodule update --remote Zonos
```

## Contributing

1. Create a new branch from `development`:
```bash
git checkout -b feature/your-feature
```

2. Make your changes and commit:
```bash
git commit -m "feat: your feature description"
```

3. Push to your branch and create a pull request to `development`

## Branch Strategy

- `main`: Production releases
- `development`: Active development
- Feature branches: Individual features and fixes

## License

[MIT License](LICENSE)

## Support

For issues and feature requests, please use the GitHub issue tracker.
