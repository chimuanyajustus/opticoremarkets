# Opticore Markets - Modern Fintech Trading Platform

A modern, responsive fintech/trading platform frontend built with React, Vite, and Tailwind CSS. Features a professional dark UI with smooth animations and glassmorphism design.

## 🚀 Features

- **Modern UI/UX**: Dark theme with glassmorphism cards and neon accents
- **Fully Responsive**: Mobile-first design that works on all devices
- **Smooth Animations**: Framer Motion powered transitions and hover effects
- **Professional Design**: Inspired by top trading platforms
- **Type-Safe**: Built with TypeScript for better development experience
- **Component Library**: Reusable components for consistent UI

## 🛠️ Tech Stack

- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons
- **Recharts** - Chart components

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx      # Custom button component
│   ├── Card.tsx        # Glassmorphism card component
│   ├── Input.tsx       # Form input component
│   ├── Modal.tsx       # Modal dialog component
│   ├── Table.tsx       # Data table component
│   ├── PricingCard.tsx # Pricing plan card
│   └── StatCard.tsx    # Statistics display card
├── pages/              # Page components
│   ├── LandingPage.tsx # Homepage with hero, features, etc.
│   ├── LoginPage.tsx   # Authentication page
│   ├── RegisterPage.tsx# User registration page
│   └── DashboardPage.tsx# Trading dashboard
├── layouts/            # Layout components
│   ├── MainLayout.tsx  # Public pages layout
│   └── DashboardLayout.tsx# Dashboard layout with sidebar
├── routes/             # Routing configuration
│   └── index.tsx       # Route definitions
├── data/               # Mock data and constants
│   └── mockData.ts     # Sample data for demo
├── hooks/              # Custom React hooks
├── assets/             # Static assets
└── App.tsx            # Main app component
```

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd fetch
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint Code

```bash
npm run lint
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue to Purple gradient (`from-blue-600 to-purple-600`)
- **Background**: Dark gray (`gray-900`)
- **Cards**: Semi-transparent with blur (`gray-800/50`)
- **Text**: White and gray variants
- **Accents**: Neon highlights and shadows

### Typography
- **Headings**: Bold, gradient text for branding
- **Body**: Clean sans-serif font
- **Sizes**: Responsive scaling

### Components
- **Buttons**: Multiple variants (primary, secondary, outline, ghost)
- **Cards**: Glassmorphism effect with hover animations
- **Forms**: Consistent styling with focus states
- **Tables**: Clean data presentation
- **Modals**: Overlay dialogs with animations

## 📱 Pages

### Landing Page
- Hero section with animated background
- Statistics counters
- Feature showcase
- Pricing plans
- Testimonials carousel
- FAQ accordion
- Footer with links

### Authentication
- Login form with validation
- Registration form
- Password visibility toggle
- Form error handling

### Dashboard
- Portfolio overview with charts
- Trading interface preview
- Market watchlist
- Recent trades table
- Wallet balance display
- Activity graphs

## 🔧 Customization

### Adding New Components
1. Create component in `src/components/`
2. Export from component file
3. Use in pages/layouts as needed

### Modifying Styles
- Update Tailwind classes directly in components
- Add custom CSS in `src/index.css` if needed
- Modify design tokens in component files

### Adding New Pages
1. Create page component in `src/pages/`
2. Add route in `src/routes/index.tsx`
3. Update navigation if needed

## 📊 Mock Data

All data is stored in `src/data/mockData.ts` and includes:
- User statistics
- Feature descriptions
- Pricing plans
- Testimonials
- Chart data
- Trading history
- Wallet information

## 🚀 Deployment

The app is ready for deployment to any static hosting service:

1. Build the project: `npm run build`
2. Deploy the `dist/` folder to your hosting provider
3. Configure routing for SPA (if needed)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is for demonstration purposes only.

## ⚠️ Disclaimer

This is a frontend-only demo application. It does not include real trading functionality, payment processing, or backend services. All data is mocked and for presentation purposes only.
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
