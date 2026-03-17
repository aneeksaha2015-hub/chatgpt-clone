# Authentication Pages & Theme System Documentation

## Overview

This documentation covers the modern, responsive authentication pages (Login & Register) and the centralized theme management system.

## Features

### ✨ Design Features
- **Mobile-First Responsive Design** - Optimized for all screen sizes
- **Seamless UI** - Modern, smooth interactions with CSS transitions
- **Light/Dark Theme Support** - CSS variables-based theming system
- **Form Validation** - Real-time email and password validation
- **Error States** - Clear error messages for form fields
- **Loading States** - Button feedback during form submission

### 📱 Responsive Breakpoints
- **Mobile**: 0px - 639px
- **Tablet**: 640px - 767px
- **Desktop**: 768px - 1024px
- **Large Desktop**: 1024px+

## File Structure

```
Frontend/src/
├── styles/
│   ├── theme.css          # CSS variables (colors, spacing, typography)
│   └── auth.css           # Authentication page styles
├── pages/
│   ├── Login.jsx          # Login page component
│   ├── Register.jsx       # Register page component
│   └── Home.jsx           # Home page component
├── utils/
│   └── themeManager.js    # Theme management utility
├── hooks/
│   └── useTheme.js        # useTheme custom hook
└── main.jsx               # Entry point with theme initialization
```

## Theme System

### CSS Variables (theme.css)

All design tokens are defined as CSS custom properties:

```css
/* Primary Colors */
--primary-color: #6366f1
--primary-light: #818cf8
--primary-dark: #4f46e5

/* Background Colors */
--bg-primary: #ffffff
--bg-secondary: #f9fafb
--bg-tertiary: #f3f4f6

/* Text Colors */
--text-primary: #1f2937
--text-secondary: #6b7280
--text-tertiary: #9ca3af

/* Spacing Scale */
--spacing-xs: 0.25rem (4px)
--spacing-sm: 0.5rem (8px)
--spacing-md: 1rem (16px)
--spacing-lg: 1.5rem (24px)
--spacing-xl: 2rem (32px)
--spacing-2xl: 2.5rem (40px)

/* Border Radius */
--radius-sm: 0.375rem (6px)
--radius-md: 0.5rem (8px)
--radius-lg: 0.75rem (12px)
--radius-xl: 1rem (16px)
--radius-2xl: 1.5rem (24px)

/* Typography Sizes */
--text-xs: 0.75rem
--text-sm: 0.875rem
--text-base: 1rem
--text-lg: 1.125rem
--text-xl: 1.25rem
--text-2xl: 1.5rem

/* Transitions */
--transition-fast: 150ms ease-in-out
--transition-normal: 300ms ease-in-out
--transition-slow: 500ms ease-in-out

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)

/* Status Colors */
--success-color: #10b981
--error-color: #ef4444
--warning-color: #f59e0b
--info-color: #3b82f6
```

### Theme Variants

**Light Theme** (Default)
- Clean white backgrounds
- Dark text for readability
- Indigo primary color

**Dark Theme**
- Dark backgrounds
- Light text
- Bright indigo accents

### Applying Themes

#### Option 1: Using ThemeManager (JavaScript)

```javascript
import ThemeManager from './utils/themeManager.js'

// Set theme
ThemeManager.setTheme('dark') // or 'light'

// Toggle theme
ThemeManager.toggleTheme()

// Get current theme
const currentTheme = ThemeManager.getTheme()
```

#### Option 2: Using useTheme Hook (React)

```jsx
import { useTheme } from './hooks/useTheme.js'

function MyComponent() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button onClick={toggleTheme}>
      Switch to {theme === 'dark' ? 'light' : 'dark'} mode
    </button>
  )
}
```

#### Option 3: System Preference

The theme automatically adapts to system preference if no manual selection is saved.

## Authentication Pages

### Login Page
**File**: `Frontend/src/pages/Login.jsx`

**Fields**:
- Email Address (with validation)
- Password (minimum 6 characters)

**Features**:
- Email format validation
- Password validation
- Error state display
- Loading state during submission
- Link to register page

**Example Usage**:
```jsx
import Login from './pages/Login'

// In your router
<Route path="/login" element={<Login />} />
```

### Register Page
**File**: `Frontend/src/pages/Register.jsx`

**Fields**:
- First Name
- Last Name
- Email Address (with validation)
- Password (minimum 6 characters)
- Confirm Password (must match)

**Features**:
- All form field validation
- Password matching validation
- Error messages for each field
- Loading state during submission
- Link to login page

**Example Usage**:
```jsx
import Register from './pages/Register'

// In your router
<Route path="/register" element={<Register />} />
```

## Form Validation

Both forms include client-side validation:

```javascript
// Email validation
/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

// Password requirements
- Minimum 6 characters
- Must match confirm password (register only)
```

## Styling Classes

### Container Classes
```css
.auth-container   /* Main authentication page wrapper */
.auth-card        /* Card container for login/register form */
```

### Form Classes
```css
.auth-form        /* Form wrapper */
.form-group       /* Individual form field wrapper */
.form-row         /* Row for multiple fields (responsive) */
```

### Input Classes
```css
.form-group input         /* Standard input field */
.form-group input:focus   /* Focus state with blue ring */
.input-error              /* Error state styling */
```

### Button Classes
```css
.btn-submit               /* Primary submit button */
.btn-submit:hover         /* Hover state with elevation */
.btn-submit:disabled      /* Disabled state */
```

### Utility Classes
```css
.form-error               /* Error message text */
.form-success             /* Success message text */
.loading                  /* Loading state text */
```

## Responsive Design Examples

### Mobile (0-639px)
```css
- Full width with padding
- Stacked form fields
- Adjusted padding and margins
- Touch-friendly button sizes
```

### Tablet (640px+)
```css
- Two-column form layout
- Larger card width (max-width: 500px)
- Increased padding
```

### Desktop (768px+)
```css
- Optimized card positioning
- Smooth animations
- Increased shadows for depth
```

## Usage Example: Complete Setup

```jsx
// 1. Import components
import Login from './pages/Login'
import Register from './pages/Register'
import AppRoutes from './AppRoutes'

// 2. AppRoutes.jsx already includes theme setup
// 3. Theme automatically initializes from main.jsx

// 4. Users can toggle theme anywhere using useTheme hook
import { useTheme } from './hooks/useTheme'

function Header() {
  const { theme, toggleTheme } = useTheme()
  return <button onClick={toggleTheme}>🌓 Theme</button>
}
```

## Browser Support

- ✅ Chrome/Edge 49+
- ✅ Firefox 31+
- ✅ Safari 9.1+
- ✅ Opera 36+
- ✅ Mobile Safari 9.3+
- ✅ Chrome Android 49+

CSS Custom Properties (CSS Variables) are supported on all modern browsers.

## Customization Guide

### Changing Colors

Edit `src/styles/theme.css`:

```css
:root {
  --primary-color: #your-color;
  --primary-light: #your-light-color;
  --primary-dark: #your-dark-color;
  /* ... more variables */
}
```

### Changing Spacing

Modify spacing variables in `theme.css`:

```css
--spacing-md: 1rem; /* Change this value */
```

### Changing Fonts

Add to `src/styles/auth.css` body:

```css
body {
  font-family: 'Your Font Name', sans-serif;
}
```

### Adding Custom Theme Variants

Extend `theme.css` with new data-theme attributes:

```css
[data-theme="custom"] {
  --primary-color: #custom-color;
  /* ... additional overrides */
}
```

## Next Steps: Backend Integration

Replace TODO comments in `Login.jsx` and `Register.jsx`:

```javascript
// Replace this:
// TODO: Implement login API call

// With actual API call:
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
const data = await response.json()
// Handle response...
```

## Performance Notes

- CSS variables are compiled at runtime
- Smooth 60fps transitions with CSS animations
- Lazy-loaded components via React.lazy in AppRoutes
- Minimal re-renders with proper React hooks usage
- Optimized shadows and gradients

## Accessibility Features

- ✅ Semantic HTML structure
- ✅ ARIA labels where needed
- ✅ Keyboard navigation support
- ✅ High contrast color combinations
- ✅ Focus states clearly visible
- ✅ Error messages linked to inputs

## Troubleshooting

### Theme not persisting across page reload?
Check browser's localStorage is enabled and check browser console for errors.

### Styles not applying?
Ensure theme.css and auth.css are imported in main.jsx.

### Dark theme not working?
Check if `[data-theme="dark"]` attribute is set on `<html>` element.

### Form validation not working?
Ensure browser console doesn't show JavaScript errors in Login/Register components.
