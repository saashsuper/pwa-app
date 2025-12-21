# PROMAN PWA - React + TypeScript + Vite

This is the Progressive Web App (PWA) frontend for the PROMAN Property Management System.

## API Configuration

The app automatically detects the environment and uses the appropriate API URL:

### Local Development

For local development, create a `.env.local` file in the root directory:

```env
VITE_API_URL=https://proman.ddev.site/mobile-api
```

Or set it inline when starting the dev server:
```bash
VITE_API_URL=https://proman.ddev.site/mobile-api npm run dev
```

**Note:** If `VITE_API_URL` is not set in development mode, it defaults to `https://proman.ddev.site/mobile-api`

### Production

For production deployments, set the `VITE_API_URL` environment variable in your deployment platform:

```env
VITE_API_URL=https://saashmagna.com/mobile-api
```

**Note:** If `VITE_API_URL` is not set in production, it defaults to `https://saashmagna.com/mobile-api`

## Getting Started

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json', './tsconfig.app.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
