# 💻 Development Guide

## Development Workflow

### Setup for Development

1. **Install Node.js** (v16+) from [nodejs.org](https://nodejs.org)
2. **Clone/Download** the project
3. **Install dependencies**: `npm install`
4. **Set environment variables**: Copy `.env.example` to `.env.local`
5. **Start dev server**: `npm run dev`

### Project Structure Overview

#### `/components`
- Reusable React components
- Each component should be self-contained
- Use `React.memo()` for optimization
- Add TypeScript interfaces for props

#### `/hooks`
- Custom React hooks
- useWeather.ts - Main data fetching hook
- Keep business logic separate from components

#### `/pages`
- Next.js page routes
- index.tsx - Home page
- _app.tsx - App wrapper with ErrorBoundary

#### `/utils`
- Pure utility functions
- weatherUtils.ts - Weather data formatting
- No side effects or component logic

#### `/constants`
- Centralized configuration
- API keys reference
- Animation timings
- Error messages

#### `/types`
- TypeScript type definitions
- weather.ts - All weather-related types
- Keep types organized and documented

#### `/styles`
- Global CSS and animations
- Tailwind base styles
- Custom animation definitions

## Development Best Practices

### Component Creation

```typescript
// Use TypeScript with interfaces
interface ComponentProps {
  data: WeatherData;
  onAction?: (value: string) => void;
}

// Memoize components to prevent unnecessary renders
const MyComponent = React.memo<ComponentProps>(
  ({ data, onAction }) => {
    return <div>{/* component */}</div>;
  }
);

MyComponent.displayName = 'MyComponent';
export default MyComponent;
```

### Hook Creation

```typescript
// Document hooks with JSDoc
/**
 * Fetches weather data
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns Weather data and utilities
 */
export function useWeather(lat?: number, lon?: number) {
  // Hook implementation
  return { data, loading, error };
}
```

### Error Handling

```typescript
// Always use try-catch for async operations
try {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  return data;
} catch (error) {
  console.error('Error:', error);
  setError(error.message);
  return null;
}
```

### TypeScript Tips

- Avoid `any` type - use proper interfaces
- Use union types for variants: `type Status = 'pending' | 'success' | 'error'`
- Define interfaces for API responses
- Use `keyof` for object keys: `type Keys = keyof T`

## Code Quality

### Linting & Formatting

```bash
npm run type-check      # Check TypeScript errors
npm run format          # Format code
npm run format:check    # Check formatting
```

### Performance Optimization

1. **Memoization**: Use `React.memo()` for components
2. **Lazy Loading**: Use `dynamic()` for heavy components
3. **Hook Dependencies**: Keep dependency arrays correct
4. **Event Handlers**: Use `useCallback()` when needed

### Accessibility

- Use semantic HTML
- Add aria-labels for interactive elements
- Ensure keyboard navigation works
- Test with screen readers

## Adding Features

### Example: Add a New Component

1. Create component file: `/components/MyFeature.tsx`
2. Add TypeScript interfaces
3. Import dependencies
4. Implement component
5. Memoize if needed
6. Export and use in pages

### Example: Add a New Hook

1. Create hook file: `/hooks/useMyFeature.ts`
2. Add TypeScript types
3. Add JSDoc documentation
4. Implement hook logic
5. Export for use in components

### Example: Add a New Page

1. Create page file: `/pages/mypage.tsx`
2. Import components
3. Implement page layout
4. Add error handling
5. Test routing

## Debugging

### Browser DevTools

- **Network Tab**: Monitor API calls
- **Console**: Check for errors
- **Elements**: Inspect HTML/CSS
- **Sources**: Debug JavaScript

### VS Code Debugging

Add to `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js Debug",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "console": "integratedTerminal"
    }
  ]
}
```

### Common Issues

**Problem**: "Module not found"
- Check import paths
- Verify file exists
- Clear `.next` folder and rebuild

**Problem**: "TypeError: Cannot read property 'x' of undefined"
- Add null checks
- Use optional chaining: `data?.property`
- Check API response structure

**Problem**: "Hydration mismatch"
- Use `useEffect` for client-only code
- Use `dynamic()` for SSR incompatible components
- Check environment variables

## Testing (Future)

When adding tests:

```bash
npm install --save-dev jest @testing-library/react
```

Create test files: `components/__tests__/MyComponent.test.tsx`

```typescript
import { render, screen } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('text')).toBeInTheDocument();
  });
});
```

## Deploying

### Local Build Testing

```bash
npm run build
npm start
```

### Vercel Deployment

```bash
npm install -g vercel
vercel
```

Follow the prompts and add environment variables in Vercel dashboard.

## Configuration Files

### tsconfig.json
- TypeScript compiler settings
- Path aliases, strict mode, etc.

### next.config.js
- Next.js specific configuration
- Image optimization, headers, etc.

### tailwind.config.js
- Tailwind CSS customization
- Colors, fonts, spacing, etc.

### postcss.config.js
- Post-processing CSS
- Autoprefixer, Tailwind, etc.

## Environment Variables

Always add sensitive data to `.env.local`:
- API keys
- Database URLs
- Feature flags
- Private configuration

Use `NEXT_PUBLIC_` prefix only for client-side variables.

## Performance Monitoring

### Lighthouse
- Run audit in Chrome DevTools
- Check performance, accessibility, SEO

### Web Vitals
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [WeatherAPI](https://www.weatherapi.com)

## Getting Help

1. Check code comments and JSDoc
2. Review IMPROVEMENTS.md
3. Check browser console
4. Search GitHub issues
5. Check documentation links above

---

**Happy Developing! 🚀**
