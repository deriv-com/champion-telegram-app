# Champion Trade Telegram App

A mini version of [Champion Trade](https://champion.trade/) platform designed specifically for Telegram users. This app provides a seamless trading experience within the Telegram ecosystem by integrating Champion Trade's powerful trading capabilities with Telegram's native features.

## Quick Links

- 🤖 **Telegram Bot**: [Champion Trade Bot](https://t.me/champion_trade_bot)
- 📱 **Mini App**: [Champion Trader](https://t.me/champion_trade_bot/championtrader)
- 📦 **Bot Repository**: [champion-telegram-bot](https://github.com/aliakbar-deriv/champion-telegram-bot)

Key benefits:
- **Native Telegram Experience**: Seamless authentication and payments using Telegram's built-in systems
- **Simplified Trading**: Streamlined interface optimized for Telegram's mini-app format
- **Full Integration**: Direct access to Champion Trade's trading features within Telegram

## Features

- 🚀 Seamless Telegram Integration
  - Native authentication using Telegram
  - Integrated payment system
  - Smooth user experience within Telegram
- 💹 Trading Features
  - Real-time market data
  - Position management
  - Trade execution
  - Cashier functionality
- ⚡️ Technical Features
  - Built with Vite for fast development
  - Modern React with hooks
  - CSS modules for styling
  - Comprehensive testing
  - Feature-based architecture
  - State management with Zustand

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
├── assets/           # Static assets
│   ├── images/       # Image assets
│   └── styles/       # Global styles
├── config/           # App configuration files (environment settings, routing configuration)
├── constants/        # Application-wide constants (API endpoints, error messages, shared enums)
├── features/         # Feature-based modules organized by domain
│   ├── auth/         # Authentication feature
│   │   └── components/
│   ├── cashier/      # Cashier feature
│   │   ├── api/
│   │   ├── components/
│   │   └── hooks/
│   ├── home/         # Home feature
│   │   └── components/
│   ├── positions/    # Positions feature
│   │   ├── api/
│   │   ├── components/
│   │   └── hooks/
│   └── trade/        # Trade feature
│       ├── api/
│       ├── components/
│       └── hooks/
├── hooks/            # Global custom React hooks for shared functionality (authentication, notifications, WebSocket)
├── services/         # Service layer for external communication (HTTP clients, WebSocket, authentication)
├── shared/           # Shared code and components used across multiple features
│   ├── components/   # Shared components
│   └── layouts/      # Layout components
├── utils/            # Utility functions (error handling, data formatting, validation, Telegram helpers)
└── test/            # Test setup
```

## Development

### Environment Configuration

The following environment variables are required to run the application:

```bash
# API Configuration
VITE_API_BASE_URL=      # Base URL for API requests
VITE_WS_URL=            # WebSocket server URL

# Security Configuration
VITE_ENCRYPTION_KEY=    # Key used for encrypting sensitive data

# Deriv OAuth Configuration
VITE_DERIV_OAUTH_URL=   # Deriv OAuth authorization URL
VITE_DERIV_SIGNUP_URL=  # Deriv signup page URL
```

Create a `.env` file in the root directory with these required variables. Additional optional configurations can be found in `.env.example`.

### Build Configuration

The application uses Vite with the following configuration:

#### Development Server
- Port: 5173
- Auto-opens browser on start
- Source maps enabled in development and staging

#### Production Build
- Minification enabled
- Source maps disabled
- Content Security Policy (CSP) enabled with:
  - Allowed sources for scripts, styles, and connections
  - Telegram domains whitelisted
  - API endpoint whitelisted

#### Code Splitting
Manual chunk splitting is implemented to optimize application loading and caching:
- Vendor chunk: React core libraries
  - Separates frequently-updated app code from stable dependencies
  - Enables better browser caching of rarely-changing vendor libraries
- TWA chunk: Telegram Web App SDK
  - Loads Telegram-specific functionality only when needed
  - Reduces initial bundle size for non-Telegram environments
This splitting strategy improves initial page load times by reducing the main bundle size and enables more efficient caching strategies.

#### Testing Configuration
- Environment: JSDOM
- Coverage provider: V8
- Coverage reports: text, JSON, and HTML
- Excludes test files and types from coverage

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
