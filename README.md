# Telegram Web App

A modern React-based Telegram Web App built with Vite.

## Features

- 🚀 Built with Vite for lightning-fast development
- ⚡️ Modern React with hooks and functional components
- 📱 Telegram Web App SDK integration
- 🎨 SCSS modules with modern Sass features
- ✅ Testing with Vitest and React Testing Library
- 📦 Feature-based project structure
- 🔧 ESLint + Prettier for code quality

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Project Structure

```
src/
├── features/           # Feature-based modules
│   ├── home/          # Home feature
│   │   ├── components/
│   │   └── index.js
│   └── auth/          # Auth feature
├── shared/            # Shared code
│   ├── assets/        # Shared assets
│   ├── components/    # Shared components
│   ├── hooks/         # Shared hooks
│   ├── layouts/       # Layout components
│   └── utils/         # Shared utilities
├── styles/            # Global styles
│   ├── _variables.scss
│   ├── _mixins.scss
│   └── main.scss
├── config/            # App configuration
├── constants/         # App constants
└── test/             # Test setup
```

## Development

### Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Lint code
- `npm run format` - Format code

### Testing

Tests are co-located with their components:

```
Component.jsx
Component.test.jsx
```

Run tests with:

```bash
# Run tests in watch mode
npm test

# Run tests with coverage
npm run test:coverage
```

## Contributing

1. Create a feature branch
2. Commit changes
3. Push your branch
4. Create a pull request

## License

MIT
