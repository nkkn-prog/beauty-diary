# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # Install dependencies
npx expo start       # Start development server (press i for iOS, a for Android, w for web)
npm run ios          # Start on iOS simulator
npm run android      # Start on Android emulator
npm run web          # Start web version
npm run lint         # Run ESLint
npm run reset-project # Move starter code to app-example and create blank app directory
```

## Architecture

This is a React Native Expo app (SDK 54) for tracking beauty treatments and supplements, built with file-based routing via expo-router.

### Routing Structure

- `app/_layout.tsx` - Root layout with Stack navigator and theme provider
- `app/(tabs)/` - Tab-based navigation with 4 visible tabs:
  - `index.tsx` - Home screen (ホーム)
  - `calendar.tsx` - Calendar view (カレンダー)
  - `stats.tsx` - Statistics (統計)
  - `profile.tsx` - User profile (マイページ)
- `app/modal.tsx` - Modal screen
- `app/treatments/new.tsx` - New treatment form

### Key Directories

- `components/` - Reusable components
  - `components/home/` - Home screen specific components (exported via barrel file)
  - `components/calendar/` - Calendar screen components
  - `components/ui/` - Generic UI components
- `constants/theme.ts` - Color palette and font configuration (light/dark themes with sage green accent)
- `hooks/` - Custom hooks for color scheme and theming

### Import Aliases

Uses `@/*` path alias (configured in tsconfig.json) mapping to project root:
```typescript
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
```

### Theming

- Automatic light/dark mode via `useColorScheme` hook
- Colors defined in `constants/theme.ts` with sage green (`#6B8E7B`) as primary accent
- Components use `ThemedText` and `ThemedView` for consistent styling

### Experimental Features

- TypeScript strict mode enabled
- Expo typed routes (`experiments.typedRoutes: true`)
- React Compiler enabled (`experiments.reactCompiler: true`)
- New Architecture enabled (`newArchEnabled: true`)
