# Telegram Web App

A modern React-based Telegram Web App built with Vite.

## Features

- 🚀 Built with Vite for lightning-fast development
- ⚡️ Modern React with hooks and functional components
- 📱 Telegram Web App SDK integration
- 🎨 CSS modules for scoped styling
- ✅ Testing with Vitest and React Testing Library
- 📦 Feature-based project structure
- 🔧 ESLint + Prettier for code quality
- 💾 State management with Zustand
- 🎯 Type-safe Telegram Web App types
- 🛠️ Utility-first styling with clsx

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
├── api/               # API related code
│   ├── interceptors/
│   ├── services/
│   └── telegram/
├── assets/           # Static assets
│   ├── fonts/
│   ├── icons/
│   ├── images/
│   └── styles/       # Global styles
├── config/           # App configuration
├── constants/        # App constants
├── features/         # Feature-based modules
│   └── home/         # Home feature
│       ├── api/
│       ├── components/
│       ├── hooks/
│       ├── store/
│       ├── types/
│       └── utils/
├── hooks/            # Global hooks
├── services/         # Service layer
│   ├── analytics/
│   ├── storage/
│   └── telegram/
├── shared/           # Shared code
│   ├── components/   # Shared components
│   └── layouts/      # Layout components
├── store/            # Global state management
├── types/            # TypeScript types
├── utils/            # Utility functions
└── test/            # Test setup
```

## Development

### Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Required environment variables:

```env
# App
VITE_APP_NAME=Champion Trader        # Your application name
VITE_APP_URL=http://localhost:3000   # Your application URL

# Telegram WebApp
VITE_TELEGRAM_BOT_USERNAME=your_bot_username  # Your Telegram bot username
VITE_TELEGRAM_BOT_TOKEN=your_bot_token        # Your Telegram bot token

# API
VITE_API_BASE_URL=http://localhost:8000/api   # Your API base URL

# Feature Flags
VITE_ENABLE_ANALYTICS=false   # Enable/disable analytics
VITE_ENABLE_DARK_MODE=true    # Enable/disable dark mode

# Build
VITE_BUILD_MODE=development   # development | production | staging
```

### Telegram Bot Setup

1. Create a new bot with [@BotFather](https://t.me/botfather) on Telegram
2. Use the `/newbot` command and follow the instructions
3. Copy the bot token provided by BotFather
4. Set the bot token in your `.env` file as `VITE_TELEGRAM_BOT_TOKEN`
5. Set the bot username in your `.env` file as `VITE_TELEGRAM_BOT_USERNAME`

### Build Modes

The application supports three build modes:

- `development`: Development mode with hot reloading and debug features
- `staging`: Staging environment for testing
- `production`: Production build with optimizations

Set the build mode in your `.env` file:
```env
VITE_BUILD_MODE=development  # or staging or production
```

### Telegram Web App Integration

This app uses the `@twa-dev/sdk` package for Telegram Web App integration. The main functionality is wrapped in a `useTelegram` hook that provides:

#### Basic Features
```javascript
const {
  isExpanded,            // Whether the web app is in expanded mode
  platform,              // Current platform (e.g., android, ios)
  colorScheme,           // Current color scheme (light/dark)
  themeParams,           // Telegram theme parameters
} = useTelegram();
```

#### UI Controls
```javascript
const {
  // Back Button
  handleBackButton,      // Show and handle back button clicks
  isBackButtonVisible,   // Back button visibility state
  
  // Main Button
  handleMainButton,      // Show and customize main button
  isMainButtonVisible,   // Main button visibility state
} = useTelegram();

// Example: Setting up a main button
useEffect(() => {
  const cleanup = handleMainButton({
    text: "Continue",
    color: "#2481cc",
    textColor: "#ffffff",
    callback: () => {
      // Handle click
    }
  });
  
  return cleanup; // Cleans up listeners and hides button
}, []);
```

#### Popups and Alerts
```javascript
const {
  showPopup,            // Show a popup with custom buttons
  showAlert,            // Show a simple alert
  showConfirm,          // Show a confirmation dialog
} = useTelegram();

// Example: Showing a confirmation
const confirmed = await showConfirm("Are you sure?");
```

#### Theme Integration
The app automatically syncs with Telegram's theme:
- Theme colors are available as CSS variables (e.g., `--tg-theme-bg-color`)
- Theme changes are handled automatically
- Dark/light mode support is built-in

#### Haptic Feedback
```javascript
const { haptic } = useTelegram();

// Available feedback types
haptic.impact();         // Generic impact
haptic.notification();   // Notification feedback
haptic.selection();      // Selection feedback
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

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
