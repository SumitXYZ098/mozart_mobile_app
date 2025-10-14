# React Native + NativeWind Project

This project demonstrates how to use NativeWind (Tailwind CSS for React Native) with Expo.

## Features

- ✅ React Native with Expo
- ✅ TypeScript support
- ✅ NativeWind (Tailwind CSS for React Native)
- ✅ Custom components with Tailwind styling
- ✅ Responsive design examples

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Development Server

```bash
# For iOS
npm run ios

# For Android
npm run android

# For Web
npm run web
```

## Project Structure

```
mozart_mobile_app/
├── App.tsx                 # Main app component with NativeWind examples
├── components/             # Reusable components
│   ├── Button.tsx         # Custom button component
│   └── Card.tsx           # Custom card component
├── global.css             # Global Tailwind CSS imports
├── metro.config.js        # Metro bundler configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── nativewind-env.d.ts    # TypeScript declarations for NativeWind
└── package.json           # Project dependencies
```

## Key Files Configuration

### tailwind.config.js
```javascript
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### metro.config.js
```javascript
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
```

### global.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Usage Examples

### Basic Styling
```tsx
<View className="flex-1 bg-gray-100 items-center justify-center">
  <Text className="text-2xl font-bold text-blue-500">
    Hello NativeWind!
  </Text>
</View>
```

### Custom Components
```tsx
import { Button } from './components/Button';
import { Card } from './components/Card';

// Button with different variants
<Button 
  title="Click me" 
  onPress={() => console.log('Pressed')} 
  variant="primary" 
/>

// Card with different variants
<Card 
  title="Card Title"
  description="Card description"
  variant="primary"
  onPress={() => console.log('Card pressed')}
/>
```

## Available Tailwind Classes

NativeWind supports most Tailwind CSS classes:

- **Layout**: `flex`, `items-center`, `justify-center`, `flex-1`
- **Spacing**: `p-4`, `m-2`, `px-6`, `py-3`
- **Colors**: `bg-blue-500`, `text-white`, `border-gray-300`
- **Typography**: `text-lg`, `font-bold`, `text-center`
- **Borders**: `rounded-lg`, `border-2`, `border-blue-500`
- **Shadows**: `shadow-lg`, `shadow-sm`
- **Opacity**: `opacity-80`

## Troubleshooting

1. **Metro bundler cache issues**: Clear cache with `npx expo start --clear`
2. **TypeScript errors**: Make sure `nativewind-env.d.ts` is included in your TypeScript configuration
3. **Styles not applying**: Verify that `global.css` is imported in your main App component

## Resources

- [NativeWind Documentation](https://www.nativewind.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Expo Documentation](https://docs.expo.dev/)
