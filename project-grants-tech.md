# Project Grants Technical Documentation

## Configuration Files

### `next.config.mjs`

This file configures the Next.js application.

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ESLint configuration:
  // - ignoreDuringBuilds: true - Disables ESLint checks during the build process.
  //   This can speed up builds but might hide linting errors until runtime or a separate linting step.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // TypeScript configuration:
  // - ignoreBuildErrors: true - Prevents TypeScript errors from failing the build.
  //   Similar to the ESLint setting, this can speed up builds but may lead to unhandled TypeScript errors.
  typescript: {
    ignoreBuildErrors: true,
  },
  // Image optimization configuration:
  // - formats: ['image/avif', 'image/webp'] - Specifies preferred image formats for optimization.
  //   Next.js will attempt to serve images in these formats if the browser supports them, falling back to the original format.
  // - remotePatterns: [...] - Defines a list of allowed remote image source hostnames.
  //   The pattern '{ protocol: 'https', hostname: '**' }' allows images from any HTTPS source. This is a broad setting and might be a security concern if not intended.
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // React Strict Mode:
  // - reactStrictMode: false - Disables React Strict Mode.
  //   Strict Mode helps identify potential problems in an application by activating additional checks and warnings for its descendants. Disabling it might hide issues.
  reactStrictMode: false,
  // Powered By Header:
  // - poweredByHeader: false - Disables the 'X-Powered-By: Next.js' header in responses.
  //   This can be a minor security measure to avoid fingerprinting the technology stack.
  poweredByHeader: false,
  // Experimental Features:
  // - optimizeCss: true - Enables experimental CSS optimization features.
  //   This can potentially reduce CSS bundle sizes.
  experimental: {
    optimizeCss: true,
  },
}

export default nextConfig
```

**Summary of `next.config.mjs`:**

*   **Build Process**: Both ESLint and TypeScript error checks are disabled during builds. This is generally not recommended for production applications as it can mask issues. It's better to fix errors rather than ignore them.
*   **Image Optimization**: Configured to use modern image formats (`AVIF`, `WebP`) and allows images from any HTTPS remote source. While flexible, allowing all hostnames (`hostname: '**'`) for remote images could be a security risk. It's better to specify known and trusted domains.
*   **React Strict Mode**: Disabled. Enabling Strict Mode is recommended during development to catch common bugs and deprecated APIs.
*   **Server Headers**: The `X-Powered-By` header is disabled, which is good practice.
*   **Experimental Features**: CSS optimization is enabled.

**Recommendations for `next.config.mjs`:**

*   **Enable ESLint and TypeScript checks during builds**: Set `ignoreDuringBuilds: false` for both `eslint` and `typescript` to catch errors early in the development lifecycle.
*   **Restrict Remote Image Sources**: Instead of `hostname: '**'`, specify a list of trusted domains for `remotePatterns` to enhance security.
*   **Enable React Strict Mode**: Set `reactStrictMode: true`, especially during development, to help identify and fix potential problems.

### `tailwind.config.ts`

This file configures Tailwind CSS, a utility-first CSS framework.

```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  // Dark Mode: 
  // - darkMode: ["class"] - Enables dark mode based on a class (e.g., <html class="dark">).
  darkMode: ["class"],
  // Content Globs:
  // - content: [...] - Specifies the files Tailwind should scan to find utility classes.
  //   This ensures that only the CSS classes used in these files are included in the final build, optimizing the CSS size.
  //   It includes pages, components, app directory files, and root-level files.
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  // Future Features:
  // - hoverOnlyWhenSupported: true - Enables hover styles only on devices that support true hovering (not touch devices).
  //   This improves user experience on touch devices by not showing hover styles on tap.
  future: {
    hoverOnlyWhenSupported: true,
  },
  // Theme Customization:
  // - theme: { ... } - Extends or overrides Tailwind's default theme.
  theme: {
    // Container Plugin Configuration:
    // - center: true - Centers the container by default.
    // - padding: { ... } - Defines default and responsive padding for the container.
    // - screens: { ... } - Defines custom breakpoints for the container matching common device sizes.
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        md: "2rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    // Extend Default Theme:
    // - extend: { ... } - Adds new utilities or extends existing ones without overriding the entire default theme section.
    extend: {
      // Background Image Utilities:
      // - "gradient-radial": "radial-gradient(var(--tw-gradient-stops))" - Adds a utility for radial gradients.
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      // Screen Breakpoints:
      // - xs: "420px" - Adds an extra small (xs) breakpoint.
      screens: {
        xs: "420px",
      },
      // Color Palette (likely for Shadcn UI or a similar component library):
      // - Defines a set of custom colors using CSS variables (e.g., hsl(var(--border))).
      //   This allows for easy theming and consistency with component library styles.
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      // Border Radius Utilities:
      // - Uses CSS variables for border radius values (e.g., var(--radius)), allowing for consistent theming.
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // Keyframes for Animations:
      // - Defines various keyframe animations for common UI effects like accordions, fades, noise, progress, and pulses.
      //   These are used by the animation utilities below.
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // ... (other keyframes for fade, noise, progress, pulse)
      },
      // Animation Utilities:
      // - Defines utility classes to apply the keyframe animations with specified durations and easing functions.
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // ... (other animation utilities)
      },
      // Transition Property Utilities:
      // - Adds utilities for common transition properties like height and spacing (margin, padding).
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
    },
  },
  // Plugins:
  // - plugins: [...] - Adds Tailwind CSS plugins to extend its functionality.
  plugins: [
    // tailwindcss-animate: Adds pre-configured animation utilities for enter/leave transitions.
    require("tailwindcss-animate"),
    // Custom Plugin for Utilities:
    // - Adds a set of custom utility classes for common CSS properties related to touch behavior and performance optimization.
    //   - `.touch-callout-none`: Disables the callout menu on touch hold.
    //   - `.tap-highlight-transparent`: Makes tap highlight color transparent.
    //   - `.will-change-transform`, `.will-change-opacity`: Hints to the browser about upcoming transformations/opacity changes for performance.
    //   - `.backface-hidden`: Hides the back face of an element during 3D transforms.
    //   - `.transform-gpu`: Promotes the element to its own layer for GPU acceleration during transforms.
    function({ addUtilities }: { addUtilities: (utilities: Record<string, Record<string, string>>) => void }) {
      const newUtilities = {
        '.touch-callout-none': {
          '-webkit-touch-callout': 'none',
        },
        '.tap-highlight-transparent': {
          '-webkit-tap-highlight-color': 'transparent',
        },
        // ... (other custom utilities)
      }
      addUtilities(newUtilities)
    },
  ],
}

export default config
```

**Summary of `tailwind.config.ts`:**

*   **Dark Mode**: Enabled via class strategy.
*   **Content Scanning**: Properly configured to scan relevant project files for utility class usage.
*   **Future Feature**: `hoverOnlyWhenSupported` is enabled for better UX on touch devices.
*   **Theme Customization**: 
    *   A responsive container with custom padding and breakpoints is defined.
    *   The theme is extended with a radial gradient, an extra small screen breakpoint (`xs`), and a comprehensive color palette based on CSS variables (likely for Shadcn UI compatibility).
    *   Border radius utilities also use CSS variables for theming.
    *   A rich set of keyframes and animation utilities are defined for various UI effects (accordion, fade, noise, progress, pulse).
    *   Custom transition property utilities are added.
*   **Plugins**:
    *   `tailwindcss-animate` is included for animation utilities.
    *   A custom plugin adds several useful utilities for touch interactions and performance hints (`will-change`, `backface-visibility`, `transform-gpu`).

**Overall Assessment:**

The Tailwind CSS configuration is well-structured and leverages many of Tailwind's powerful features for customization and optimization. The use of CSS variables for colors and border radius is excellent for theming and consistency, especially when integrating with component libraries like Shadcn UI. The custom animations and utility plugin demonstrate a good understanding of Tailwind's extensibility.

**Recommendations for `tailwind.config.ts`:**

*   **Content Specificity**: While the `content` paths are generally good, `"*.{js,ts,jsx,tsx,mdx}"` at the root level might be too broad if there are non-UI files there. It's usually better to be more specific (e.g., if you have utility functions in a root `lib` folder that don't use Tailwind classes, they don't need to be scanned).
*   **Review Custom Utilities**: Ensure all custom utilities added via the plugin are actively used and necessary. Unused utilities add to the config complexity.
*   **Consider PurgeCSS/Safelist (if needed)**: If there are dynamically generated classes that Tailwind's static analysis might miss, ensure they are safelisted if necessary, although the current content globbing is quite comprehensive.

### `tsconfig.json`

This file configures the TypeScript compiler (`tsc`) for the project.

```json
{
  "compilerOptions": {
    // Target JavaScript Environment:
    // - "lib": ["dom", "dom.iterable", "esnext"] - Specifies the library files to be included in the compilation.
    //   Includes DOM APIs, DOM iteration helpers, and modern ECMAScript features.
    "lib": ["dom", "dom.iterable", "esnext"],
    // JavaScript Interoperability:
    // - "allowJs": true - Allows JavaScript files to be compiled alongside TypeScript files.
    "allowJs": true,
    // JavaScript Target Version:
    // - "target": "ES6" (or "es2015") - Specifies the ECMAScript target version for the compiled JavaScript.
    "target": "ES6",
    // Type Checking:
    // - "skipLibCheck": true - Skips type checking of all declaration files (*.d.ts).
    //   This can speed up compilation but might miss type errors in library definitions.
    "skipLibCheck": true,
    // - "strict": true - Enables all strict type-checking options (e.g., `noImplicitAny`, `strictNullChecks`). Highly recommended for robust code.
    "strict": true,
    // Emission Control:
    // - "noEmit": true - Prevents the TypeScript compiler from emitting JavaScript files.
    //   In Next.js projects, Babel or SWC typically handles the transpilation, so `tsc` is used mainly for type checking.
    "noEmit": true,
    // Module Interoperability:
    // - "esModuleInterop": true - Enables interoperability between CommonJS and ES modules by creating synthetic default imports.
    "esModuleInterop": true,
    // Module System:
    // - "module": "esnext" - Specifies the module system to use for generated code (modern ES modules).
    "module": "esnext",
    // Module Resolution Strategy:
    // - "moduleResolution": "bundler" - Mimics how modern bundlers (like Webpack used by Next.js) resolve modules.
    //   This is the recommended setting for modern web projects.
    "moduleResolution": "bundler",
    // JSON Modules:
    // - "resolveJsonModule": true - Allows importing JSON files as modules.
    "resolveJsonModule": true,
    // Isolated Modules:
    // - "isolatedModules": true - Ensures that each file can be transpiled independently without relying on other imports for type information.
    //   This is often required by transpilers like Babel/SWC.
    "isolatedModules": true,
    // JSX Configuration:
    // - "jsx": "preserve" - Keeps JSX syntax in the output, to be transformed by another tool (e.g., Babel/SWC in Next.js).
    "jsx": "preserve",
    // Incremental Compilation:
    // - "incremental": true - Enables incremental compilation, where `tsc` stores information about the project graph from the last compilation
    //   and uses it to speed up subsequent compilations by only recompiling changed files.
    "incremental": true,
    // Compiler Plugins:
    // - "plugins": [{ "name": "next" }] - Integrates with Next.js-specific TypeScript features and optimizations.
    "plugins": [
      {
        "name": "next"
      }
    ],
    // Path Aliases:
    // - "paths": { "@/*": ["./*"] } - Defines path aliases for easier imports.
    //   `@/*` allows importing modules from the project root using `@/path/to/module`.
    "paths": {
      "@/*": ["./*"]
    }
  },
  // Files to Include:
  // - "include": [...] - Specifies an array of file paths or glob patterns that `tsc` should include in the compilation.
  //   Includes Next.js environment types, all .ts and .tsx files, and generated types in the .next directory.
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  // Files to Exclude:
  // - "exclude": ["node_modules"] - Specifies an array of file paths or glob patterns that `tsc` should ignore.
  //   Typically excludes `node_modules` to avoid compiling third-party libraries.
  "exclude": ["node_modules"]
}
```

**Summary of `tsconfig.json`:**

*   **Strictness**: `strict: true` is enabled, which is excellent for catching type-related errors early.
*   **Module System**: Uses modern ES module settings (`module: "esnext"`, `moduleResolution: "bundler"`, `esModuleInterop: true`), which are appropriate for a Next.js project.
*   **Next.js Integration**: The `next` plugin is correctly configured, and `jsx: "preserve"` and `noEmit: true` are standard for Next.js projects where SWC/Babel handles transpilation.
*   **Path Aliases**: `@/*` is set up for cleaner imports from the project root.
*   **`skipLibCheck: true`**: While common for faster builds, it means type errors in `d.ts` files from `node_modules` might be missed. For critical projects, consider setting this to `false` occasionally or in CI to catch such issues, though it will slow down type checking.
*   **`allowJs: true`**: Useful if there's a mix of JS and TS files, but if the project aims to be fully TypeScript, this could eventually be set to `false` once all JS is migrated.
*   **`target: "ES6"`**: This is a reasonable target. Next.js handles further transpilation for browser compatibility as needed.

**Overall Assessment:**

The `tsconfig.json` is well-configured for a modern Next.js project, with a strong emphasis on type safety due to `strict: true`. The settings align with Next.js best practices.

**Recommendations for `tsconfig.json`:**

*   **Consider `forceConsistentCasingInFileNames: true`**: This can help prevent issues on case-sensitive file systems by ensuring that the casing of imported file names matches the casing on disk.
*   **Review `skipLibCheck`**: If build times are not a major concern during development or in CI, setting `skipLibCheck: false` can provide more comprehensive type checking.
*   **Explicit `baseUrl`**: While `paths` implies a `baseUrl` of `.` (project root), explicitly setting `"baseUrl": "."` can sometimes improve clarity and tooling integration, though it's often inferred correctly.

### `postcss.config.mjs`

This file configures PostCSS, a tool for transforming CSS with JavaScript plugins. In Next.js projects, it's commonly used with Tailwind CSS.

```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Tailwind CSS Plugin:
    // - tailwindcss: {} - Integrates Tailwind CSS into the PostCSS build process.
    //   This allows Tailwind to scan your HTML and JavaScript/TypeScript files for utility classes and generate the necessary CSS.
    tailwindcss: {},
    // Autoprefixer Plugin (Often implicitly included or managed by Next.js/Tailwind CSS):
    // - While not explicitly listed here, `autoprefixer` is a common PostCSS plugin that adds vendor prefixes to CSS rules
    //   for broader browser compatibility. Next.js typically includes this by default when using Tailwind CSS.
  },
};

export default config;
```

**Summary of `postcss.config.mjs`:**

*   **Simplicity**: The configuration is straightforward, primarily focused on enabling the `tailwindcss` plugin.
*   **Tailwind CSS Integration**: Correctly set up to process Tailwind CSS directives and utility classes.
*   **Autoprefixer**: Next.js handles autoprefixing automatically when Tailwind CSS is used, so explicitly adding `autoprefixer` here is usually not necessary unless specific custom browser targets are needed beyond what Next.js/Tailwind provide by default.

**Overall Assessment:**

This is a standard and correct `postcss.config.mjs` for a Next.js project using Tailwind CSS. It's minimal because Next.js handles many PostCSS-related configurations internally.

**Recommendations for `postcss.config.mjs`:**

*   **No Changes Needed**: For most Next.js + Tailwind CSS projects, this configuration is sufficient. Add other PostCSS plugins only if specific, advanced CSS transformations are required that are not handled by Tailwind CSS or Next.js defaults.

### `.eslintrc.json`

This file configures ESLint, a pluggable and configurable linter tool for identifying and reporting on patterns in JavaScript and TypeScript code.

```json
{
  "extends": [
    // Next.js Core Web Vitals Configuration:
    // - "next/core-web-vitals" - Extends the recommended ESLint configuration from Next.js,
    //   specifically including rules related to Core Web Vitals for performance monitoring.
    "next/core-web-vitals",
    // Next.js TypeScript Configuration:
    // - "next/typescript" - Extends the recommended ESLint configuration from Next.js for TypeScript projects.
    //   This includes rules tailored for TypeScript usage within a Next.js environment.
    "next/typescript"
  ]
  // "rules": { ... } // No custom rules are defined in this basic configuration.
}
```

**Summary of `.eslintrc.json`:**

*   **Base Configuration**: Leverages the recommended ESLint configurations provided by Next.js (`next/core-web-vitals` and `next/typescript`). This is a good starting point as it includes many best practices and rules specific to Next.js and TypeScript development.
*   **Minimal**: The configuration is minimal, relying entirely on the extended presets. There are no custom rules or overrides defined directly in this file.

**Overall Assessment:**

This is a standard and sensible default ESLint configuration for a Next.js TypeScript project. It ensures that the project adheres to the linting guidelines set forth by the Next.js team.

**Recommendations for `.eslintrc.json`:**

*   **Consider Adding Specific Rules**: As the project grows, you might want to add or override specific ESLint rules to enforce particular coding styles or catch common errors relevant to your team or project. For example:
    *   `no-console`: To disallow `console.log` statements in production code.
    *   `@typescript-eslint/explicit-function-return-type`: To require explicit return types for functions.
    *   Rules from plugins like `eslint-plugin-react-hooks` for enforcing rules of Hooks, or `eslint-plugin-jsx-a11y` for accessibility.
*   **Prettier Integration**: If using Prettier for code formatting, ensure it's integrated correctly with ESLint (e.g., using `eslint-config-prettier` to disable ESLint rules that conflict with Prettier) to avoid conflicts between the linter and formatter.
*   **IDE Integration**: Ensure your IDE is configured to use this ESLint setup for real-time feedback during development.

### `package.json`

This file is the manifest for the Node.js project. It lists the project's metadata, dependencies, and scripts.

```json
{
  "name": "my-v0-project", // Project name
  "version": "0.1.0",       // Project version
  "private": true,        // Prevents accidental publishing to npm
  "scripts": {
    // "dev": "next dev" - Starts the Next.js development server.
    "dev": "next dev",
    // "build": "node scripts/download-leaflet-assets.js && next build" - Custom build script.
    //   First, it runs a script to download Leaflet assets, then it runs the standard Next.js build.
    "build": "node scripts/download-leaflet-assets.js && next build",
    // "start": "next start" - Starts the Next.js production server (after running `next build`).
    "start": "next start",
    // "lint": "next lint" - Runs ESLint to check the codebase for linting errors.
    "lint": "next lint",
    // "download-assets": "node scripts/download-leaflet-assets.js" - A standalone script to download Leaflet assets.
    "download-assets": "node scripts/download-leaflet-assets.js"
  },
  "dependencies": {
    // UI Components & Primitives (primarily Radix UI and Shadcn UI related):
    "@hookform/resolvers": "^3.9.1", // For integrating React Hook Form with Zod or other validation libraries.
    "@radix-ui/react-accordion": "1.2.2",
    "@radix-ui/react-alert-dialog": "1.1.4",
    // ... (numerous other @radix-ui components for various UI elements like dialogs, dropdowns, etc.)
    "@radix-ui/react-slot": "1.1.1", // Utility for component composition.
    "@radix-ui/react-toast": "1.2.4",
    "@radix-ui/react-tooltip": "latest",

    // Styling & Utility Classes:
    "autoprefixer": "^10.4.20", // PostCSS plugin to parse CSS and add vendor prefixes.
    "class-variance-authority": "^0.7.1", // For creating flexible and type-safe UI components with variants (used by Shadcn UI).
    "clsx": "^2.1.1", // Utility for constructing `className` strings conditionally.
    "tailwind-merge": "^2.5.5", // Utility for merging Tailwind CSS classes without style conflicts.
    "tailwindcss-animate": "^1.0.7", // Plugin for Tailwind CSS to add enter/leave animations.

    // Core Framework & Libraries:
    "next": "15.2.4", // The React framework for production.
    "react": "^18.2.0", // JavaScript library for building user interfaces.
    "react-dom": "^18.2.0", // Serves as the entry point to the DOM and server renderers for React.

    // UI & Application Features:
    "cmdk": "1.0.4", // Fast, unstyled command menu for React (often used with Shadcn UI).
    "critters": "^0.0.25", // Webpack plugin to inline critical CSS and lazy-load the rest.
    "date-fns": "4.1.0", // Modern JavaScript date utility library.
    "embla-carousel-react": "8.5.1", // Extensible carousel library for React.
    "input-otp": "1.4.1", // One-Time Password input component.
    "lucide-react": "^0.454.0", // Library of simply beautiful icons.
    "next-themes": "^0.4.4", // Theme management for Next.js applications (e.g., dark mode).
    "react-day-picker": "^9.7.0", // Date picker component for React.
    "react-hook-form": "^7.54.1", // Performant, flexible and extensible forms with easy-to-use validation.
    "react-resizable-panels": "^2.1.7", // Resizable panels component for React.
    "recharts": "2.15.0", // Composable charting library built on React components.
    "sonner": "^1.7.1", // Opinionated toast component for React.
    "vaul": "^0.9.6", // Unstyled drawer component for React.
    "zod": "^3.24.1", // TypeScript-first schema declaration and validation library.

    // Mapping Libraries:
    "leaflet": "latest", // Open-source JavaScript library for mobile-friendly interactive maps.
    "maplibre-gl": "^5.5.0", // Open-source fork of Mapbox GL JS for vector map rendering.
    "react-leaflet": "^4.2.1" // React components for Leaflet maps.
  },
  "devDependencies": {
    // Type Definitions:
    "@types/leaflet": "^1.9.17",
    "@types/maplibre-gl": "^1.14.0",
    "@types/node": "^22",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",

    // Linting & Code Quality:
    "eslint": "^9",
    "eslint-config-next": "15.3.2", // ESLint configuration for Next.js projects.

    // Styling & Build Tools:
    "postcss": "^8", // Tool for transforming CSS with JavaScript plugins.
    "tailwindcss": "^3.4.17", // Utility-first CSS framework.

    // TypeScript:
    "typescript": "^5.8.3" // Superset of JavaScript that adds types.
  }
}
```

**Summary of `package.json`:**

*   **Project Name & Version**: `my-v0-project`, version `0.1.0`.
*   **Scripts**:
    *   Standard `dev`, `start`, `lint` scripts for Next.js.
    *   A custom `build` script that includes `node scripts/download-leaflet-assets.js` before `next build`.
    *   A dedicated `download-assets` script for Leaflet assets.
*   **Dependencies**:
    *   **UI Framework**: Heavy reliance on Radix UI primitives and related libraries like `class-variance-authority`, `clsx`, `tailwind-merge`, suggesting use of Shadcn UI or a similar methodology for building components.
    *   **Core**: `next`, `react`, `react-dom` are up-to-date.
    *   **Forms**: `react-hook-form` with `zod` for validation via `@hookform/resolvers`.
    *   **Styling**: `tailwindcss`, `autoprefixer`, `tailwindcss-animate`.
    *   **Mapping**: `leaflet`, `react-leaflet`, and `maplibre-gl` indicate significant map-based features.
    *   **Component Libraries/Utilities**: `lucide-react` (icons), `next-themes` (theming), `recharts` (charts), `sonner` (toasts), `cmdk` (command menu), `date-fns`, `embla-carousel-react`, `input-otp`, `react-day-picker`, `react-resizable-panels`, `vaul`.
    *   **Optimization**: `critters` for critical CSS.
*   **devDependencies**:
    *   Type definitions for major libraries (`leaflet`, `maplibre-gl`, `node`, `react`).
    *   Linting tools (`eslint`, `eslint-config-next`).
    *   Build tools (`postcss`, `tailwindcss`).
    *   `typescript`.

**Overall Assessment:**

The `package.json` indicates a modern, feature-rich full-stack application built with Next.js and TypeScript. The dependency list shows a strong preference for Radix UI primitives, likely utilized through Shadcn UI, for building the user interface. The inclusion of mapping libraries (Leaflet, MapLibre) and charting (Recharts) suggests complex data visualization capabilities. The project also uses robust solutions for forms, theming, and UI components.

The custom script for downloading Leaflet assets in the build process is noteworthy and implies that these assets are being managed locally rather than solely relying on a CDN for Leaflet.

**Recommendations for `package.json`:**

*   **Dependency Versions**: While many dependencies are on recent versions, using `latest` for `leaflet` and `@radix-ui/react-tooltip` can lead to unexpected breaking changes. It's generally better to pin to specific versions (e.g., `^1.9.4` or `~1.9.4`) for more predictable builds. Consider running `pnpm outdated` (or equivalent for your package manager) to review and update dependencies systematically.
*   **`critters`**: Ensure `critters` is configured correctly and providing tangible performance benefits. Critical CSS extraction can sometimes be complex to get right.
*   **Unused Dependencies**: Periodically check for unused dependencies using tools like `depcheck` to keep the project lean.
*   **Scripts Clarity**: The `download-leaflet-assets.js` script is mentioned. Its functionality will be important to understand when reviewing the `scripts` directory.

### `components.json`

This file configures the Shadcn UI CLI, which is used to add pre-built, customizable components to your project.

```json
{
  "$schema": "https://ui.shadcn.com/schema.json", // Schema for validation and autocompletion.
  // Style Configuration:
  // - "style": "default" - Specifies the default styling preset for Shadcn UI components.
  //   Other options might include "new-york", or you can create custom styles.
  "style": "default",
  // React Server Components (RSC) Support:
  // - "rsc": true - Indicates that the project is set up to use React Server Components.
  //   Shadcn UI components will be generated with RSC compatibility in mind (e.g., avoiding client-side hooks where possible).
  "rsc": true,
  // TypeScript Usage:
  // - "tsx": true - Indicates that the project uses TypeScript, so components will be generated as .tsx files.
  "tsx": true,
  // Tailwind CSS Configuration:
  // - "tailwind": { ... } - Specifies how Shadcn UI should integrate with your Tailwind CSS setup.
  "tailwind": {
    // - "config": "tailwind.config.ts" - Path to your Tailwind CSS configuration file.
    "config": "tailwind.config.ts",
    // - "css": "app/globals.css" - Path to your global CSS file where Tailwind base styles and component styles are imported.
    "css": "app/globals.css",
    // - "baseColor": "neutral" - Specifies the base color palette from Tailwind CSS to be used for Shadcn UI components (e.g., gray, slate, neutral).
    "baseColor": "neutral",
    // - "cssVariables": true - Indicates that Tailwind CSS is configured to use CSS variables for theming (common with Shadcn UI).
    "cssVariables": true,
    // - "prefix": "" - An optional prefix for Tailwind utility classes (empty string means no prefix).
    "prefix": ""
  },
  // Path Aliases:
  // - "aliases": { ... } - Defines path aliases used by the Shadcn UI CLI when generating components.
  //   This ensures that generated components use the correct import paths for your project structure.
  "aliases": {
    "components": "@/components",         // Alias for the main components directory.
    "utils": "@/lib/utils",              // Alias for a utility functions directory (often `@/lib/utils.ts`).
    "ui": "@/components/ui",            // Alias for the directory where Shadcn UI components are placed.
    "lib": "@/lib",                      // Alias for a general library directory.
    "hooks": "@/hooks"                   // Alias for a custom hooks directory.
  },
  // Icon Library:
  // - "iconLibrary": "lucide" - Specifies the icon library to be used with Shadcn UI components (Lucide React in this case).
  "iconLibrary": "lucide"
}
```

**Summary of `components.json`:**

*   **Shadcn UI Integration**: Clearly configured for use with Shadcn UI.
*   **Modern Setup**: Settings like `rsc: true`, `tsx: true`, `cssVariables: true`, and the use of `lucide-react` icons align with modern Next.js and React development practices.
*   **Tailwind CSS**: Correctly points to the `tailwind.config.ts` and global CSS file.
*   **Path Aliases**: Path aliases are well-defined, matching common project structures (e.g., `@/components`, `@/lib/utils`). This ensures that when you use the Shadcn UI CLI to add components (e.g., `pnpm dlx shadcn-ui@latest add button`), they are placed in the correct directories and use the correct import paths.
*   **Style and Base Color**: Uses the `default` style with the `neutral` base color.

**Overall Assessment:**

This `components.json` file is correctly configured for integrating Shadcn UI into a Next.js TypeScript project that uses React Server Components and Tailwind CSS with CSS variables. The path aliases are crucial for the CLI to work as expected.

**Recommendations for `components.json`:**

*   **Consistency with `tsconfig.json`**: Ensure that the path aliases defined here (`aliases.components`, `aliases.utils`, etc.) are consistent with the `paths` defined in `tsconfig.json` to avoid confusion and ensure proper module resolution by both TypeScript and the Shadcn UI CLI.
*   **Verify `app/globals.css`**: Make sure that the `tailwind.css` path (`app/globals.css`) correctly points to the file where Tailwind directives (`@tailwind base;`, `@tailwind components;`, `@tailwind utilities;`) and any Shadcn UI base styles/variables are imported. (I will check this file later).

### `vercel.json`

This file is used to configure deployments on the Vercel platform.

```json
{
  // Version of the Vercel configuration schema.
  "version": 2,
  // Specifies the framework used by the project.
  // - "framework": "nextjs" - Tells Vercel that this is a Next.js project,
  //   allowing Vercel to apply optimal build and deployment settings for Next.js.
  "framework": "nextjs",
  // Custom build command for Vercel.
  // - "buildCommand": "pnpm run build" - Overrides the default build command.
  //   It specifies that Vercel should use `pnpm run build` to build the project.
  //   This is important if the project uses pnpm as its package manager.
  "buildCommand": "pnpm run build",
  // Specifies the directory where the build output is located.
  // - "outputDirectory": ".next" - Standard for Next.js projects, where the build output
  //   (including serverless functions, static assets, etc.) is placed in the `.next` directory.
  "outputDirectory": ".next"
  // Other common Vercel configurations (not present here but often used):
  // - "rewrites": [...] - For URL rewriting rules.
  // - "redirects": [...] - For URL redirection rules.
  // - "headers": [...] - For custom HTTP headers.
  // - "functions": { ... } - For configuring serverless function memory, regions, etc.
  // - "env": { ... } - For setting environment variables specific to Vercel deployments.
}
```

**Summary of `vercel.json`:**

*   **Framework Specification**: Correctly identifies the project as `nextjs`.
*   **Custom Build Command**: Uses `pnpm run build`. This is crucial because the `package.json` showed a `build` script: `"node scripts/download-leaflet-assets.js && next build"`. Vercel will execute this custom script which includes the Leaflet asset download step.
*   **Output Directory**: Standard `.next` directory for Next.js output.

**Overall Assessment:**

This `vercel.json` file is correctly configured for deploying a Next.js project that uses `pnpm` as its package manager and has a custom build step defined in `package.json`.

**Recommendations for `vercel.json`:**

*   **Environment Variables**: If the project relies on environment variables (e.g., API keys, database URLs), ensure these are configured in the Vercel project settings rather than being hardcoded or committed in `vercel.json` (unless they are non-sensitive build-time variables).
*   **Review Build Logs**: During Vercel deployments, always review the build logs to ensure that the `pnpm run build` command (including the `download-leaflet-assets.js` script) executes successfully and that Vercel correctly identifies and deploys the Next.js output from the `.next` directory.
*   **Consider `installCommand`**: If there are specific needs for the installation step (though `pnpm install` is usually inferred correctly by Vercel when `pnpm-lock.yaml` is present), an `installCommand` could be specified.

## Application Structure (`app` directory)

The `app` directory is the core of the Next.js application, utilizing the App Router paradigm for routing, layouts, and UI components.

### `app/layout.tsx`

This file defines the root layout for the entire application. All pages and nested layouts will inherit from this root layout.

```tsx
import "./globals.css" // Imports global styles.
import { Inter } from "next/font/google" // Imports the Inter font from Google Fonts via next/font.
import { ThemeProvider } from "@/components/theme-provider" // Imports a theme provider component.

// Preload Inter font for better performance
// Configures the Inter font with subsets, display strategy, preloading, weights, and a CSS variable.
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap', // Uses font-display: swap for better perceived performance.
  preload: true,   // Preloads the font.
  weight: ['400', '500', '600', '700'], // Specifies font weights to load.
  variable: '--font-inter', // Assigns the font to a CSS variable for easy use in Tailwind.
})

// Metadata for SEO and PWA capabilities.
export const metadata = {
  title: "Earth Guardians | Project Grants",
  description: "Track granteds socioenvironmental initiatives by Earth Guardians, worldwide",
  manifest: "/manifest.json", // Path to the Web App Manifest.
  themeColor: "#000000",       // Theme color for the browser UI.
  viewport: "width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes", // Viewport settings.
  appleWebApp: { // Settings for when the app is added to the home screen on iOS.
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Earth Guardians | Project Grants",
  },
  openGraph: { // Open Graph metadata for social sharing.
    type: "website",
    locale: "en_US",
    title: "Earth Guardians | Project Grants",
    description: "Track environmental initiatives by Earth Guardians, worldwide",
    siteName: "Earth Guardians",
  },
  generator: 'Tupã Levi | 2025' // Custom generator meta tag.
}

// RootLayout component definition.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Sets language to English, suppresses hydration warnings, and applies the Inter font CSS variable to the html tag.
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* PWA and mobile-specific meta tags */}
        <link rel="apple-touch-icon" href="/icon-192x140.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#000000" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Preconnect to external resources (MapTiler API) for performance. */}
        <link rel="preconnect" href="https://api.maptiler.com" crossOrigin="anonymous" />
        
        {/* Inline styles for global resets and fixes */}
        <style>{`
          * {
            -webkit-overflow-scrolling: touch; /* Enables momentum scrolling on iOS */
            -webkit-tap-highlight-color: transparent; /* Removes tap highlight on iOS */
            -webkit-touch-callout: none; /* Disables callout menu on touch hold on iOS */
          }
          
          /* Fix for 100vh issue on mobile browsers where viewport height can be inconsistent. */
          html, body, .min-h-screen {
            height: 100%;
          }
          
          @supports (-webkit-touch-callout: none) { /* Fallback for min-height on iOS */
            .min-h-screen {
              min-height: -webkit-fill-available;
            }
          }
        `}</style>
      </head>
      {/* Applies the Inter font class name to the body. */}
      <body className={inter.className}>
        {/* Wraps children with the ThemeProvider for theme management (e.g., dark/light mode). */}
        {/* - attribute="class": Theme is applied by adding a class to the HTML element. */}
        {/* - defaultTheme="dark": Sets the default theme to dark. */}
        {/* - enableSystem: Allows the theme to follow the system preference. */}
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children} { /* Renders the actual page content or nested layouts. */}
        </ThemeProvider>
      </body>
    </html>
  )
}

export default function GlobePage() {
  // State for storing project data to be displayed on the globe.
  const [projects, setProjects] = useState<ProjectData[]>([])
  // State to toggle the visibility of a hexagonal grid overlay on the globe.
  const [showHexGrid, setShowHexGrid] = useState(true)
  // State to manage the loading status of the project data.
  const [isLoading, setIsLoading] = useState(true)
  
  // useEffect hook to load and validate project data on the client-side after component mounts.
  useEffect(() => {
    try {
      // Ensure the code runs only in the browser environment.
      if (typeof window !== 'undefined') {
        console.log("Globe page: Loading project data...");
        
        // A small delay (300ms) is introduced before processing data.
        // This might be to ensure other client-side initializations are complete or to simulate loading.
        setTimeout(() => {
          // Filter out projects that do not have valid latitude and longitude.
          const validProjects = allProjectsData.filter(project => 
            project && 
            typeof project.latitude === 'number' && 
            typeof project.longitude === 'number'
          );
          
          console.log(`Globe page: Found ${validProjects.length} valid projects out of ${allProjectsData.length}`);
          setProjects(validProjects); // Update state with validated projects.
          setIsLoading(false); // Set loading to false after data processing.
        }, 300);
      }
    } catch (error) {
      console.error("Error loading project data:", error);
      setIsLoading(false); // Set loading to false in case of an error.
    }
  }, []); // Empty dependency array ensures this effect runs only once on mount.
  
  // Handler function to toggle the visibility of the hex grid.
  const handleToggleHexGrid = () => {
    setShowHexGrid(prev => !prev);
  };
  
  // Render the main page structure.
  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      <div className="flex-1 relative"> {/* Relative positioning for child elements like controls. */}
        
        {/* Render the dynamically imported ClientGlobeWrapper component. */}
        {/* Passes the project data and hex grid visibility state as props. */}
        <ClientGlobeWrapper 
          projects={projects}
          showHexGrid={showHexGrid}
        />
        
        {/* Render the MapControls component. */}
        {/* Passes globe-specific props and the hex grid toggle handler. */}
        <MapControls 
          isGlobeView={true} // Indicates that controls are for the globe view.
          showHexGrid={showHexGrid} // Current state of hex grid visibility.
          onToggleHexGrid={handleToggleHexGrid} // Function to toggle the hex grid.
        />
      </div>
    </main>
  )
} 
  }, []);
  
  return (
    <div className="relative w-full h-screen">
      <div ref={containerRef} className="w-full h-full" />
      {isMapLoaded && <GlobalStats projects={projects} isGlobeView={true} />}
    </div>
  );
}
```

### `components/globe-component.tsx`

This component is responsible for rendering the interactive 3D globe using MapLibre GL JS. It displays project data as markers, shows connections between them, and includes visual effects like a hex grid and particle animations along connection lines.

```tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useMediaQuery } from "@/hooks/use-media-query"; // Hook for responsive design.
import { ProjectData } from "@/lib/types"; // Type for project data.
import { getProjectColor, getProjectColorByBeneficiaries } from "@/lib/colors"; // Color utility functions.
import { GlobalStats } from '@/components/global-stats'; // Stats display component.
import 'maplibre-gl/dist/maplibre-gl.css'; // MapLibre GL CSS.
import type maplibregl from 'maplibre-gl'; // Type imports for MapLibre.

const MAPTILER_API_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

// Define Connection type consistent with the rest of the app
interface Connection {
  from: [number, number];
  to: [number, number];
  from_project_indirect_beneficiaries: number;
  from_project_direct_beneficiaries: number;
}

// Define specific types for particles and markers
interface Particle {
  element: HTMLDivElement;
  currentPoint: [number, number];
  targetPoint: [number, number];
  speed: number;
}

interface ConnectionRef {
  id: string;
}

interface GlobeComponentProps {
  projects?: ProjectData[];
  showHexGrid?: boolean;
}

export function GlobeComponent({ projects = [], showHexGrid = true }: GlobeComponentProps) {
  const containerRef = useRef<HTMLDivElement>(null); // Ref for the map container div.
  const mapRef = useRef<maplibregl.Map | null>(null); // Ref for the MapLibre map instance.
  const markersRef = useRef<maplibregl.Marker[]>([]); // Ref to store marker instances.
  const connectionsRef = useRef<ConnectionRef[]>([]); // Ref to store connection layer/source IDs.
  const animationRef = useRef<number | null>(null); // Ref for animation frame requests.
  const particlesRef = useRef<HTMLDivElement[]>([]); // Ref to store particle DOM elements.
  // We do need markersLayerRef for future use, silencing the linter
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const markersLayerRef = useRef<maplibregl.LayerSpecification | null>(null);
  
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [dynamicConnections, setDynamicConnections] = useState<Connection[]>([]);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Clean up function to prevent memory leaks
  const cleanupResources = useCallback(() => {
    // Clean up markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    // Clean up connections
    connectionsRef.current.forEach(connection => {
      if (mapRef.current && connection.id) {
        if (mapRef.current.getLayer(connection.id)) {
          mapRef.current.removeLayer(connection.id);
        }
        if (mapRef.current.getSource(connection.id)) {
          mapRef.current.removeSource(connection.id);
        }
      }
    });
    connectionsRef.current = [];
    
    // Cancel animation frame
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    // Clean up particles
    particlesRef.current.forEach(p => {
      if (p && p.parentNode) {
        p.parentNode.removeChild(p);
      }
    });
    particlesRef.current = [];
  }, []);
  
  // Initialize map when component mounts
  useEffect(() => {
    let isMounted = true;
    
    const initializeMap = async () => {
      if (typeof window === 'undefined') return;
      
      try {
        const maplibreglPackage = (await import('maplibre-gl')).default;
        
        const maplibreStyles = document.createElement('link');
        maplibreStyles.rel = 'stylesheet';
        maplibreStyles.href = 'https://unpkg.com/maplibre-gl@5.5.0/dist/maplibre-gl.css';
        document.head.appendChild(maplibreStyles);
        
        if (!containerRef.current || !isMounted) return;
        
        const map = new maplibreglPackage.Map({
          container: containerRef.current,
          style: `https://api.maptiler.com/maps/satellite/style.json?key=${MAPTILER_API_KEY}`,
          zoom: isMobile ? 1.8 : 3,
          center: [0, 0],
          attributionControl: false,
          renderWorldCopies: false,
        });
        
        mapRef.current = map;
        
        map.addControl(
          new maplibreglPackage.AttributionControl({
            customAttribution: 'EARTH GUARDIANS @ 2025'
          }),
        );
        
        map.on('style.load', () => {
          if (isMounted && mapRef.current) {
            mapRef.current.setProjection({ type: 'globe' } as any); // Type assertion used here
          }
        });
        
        map.on('load', () => {
          if (isMounted) {
            setIsMapLoaded(true);
          }
        });
      } catch (err) {
        console.error("Error initializing MapLibre GL JS map:", err);
      }
    };
    
    initializeMap();
    
    return () => {
      isMounted = false;
      cleanupResources();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isMobile, cleanupResources]);
  
  // Generate connections between projects
  const generateConnections = useCallback(() => {
    if (!projects || projects.length <= 1) return [];
    const maxConnectionsPerProject = isMobile ? 2 : 3;
    const newConnections: Connection[] = [];
    const projectsToProcess = isMobile 
      ? projects.slice(0, Math.min(15, projects.length)) 
      : projects;
    
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371; // Earth radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };
    
    const usedAsTarget = new Set<string>();
    projectsToProcess.forEach(project => {
      if (!project.latitude || !project.longitude) return;
      const availableTargets = projectsToProcess.filter(
        p => p.project_title !== project.project_title && 
             p.latitude && 
             p.longitude &&
             !usedAsTarget.has(p.project_title)
      );
      if (availableTargets.length === 0) return;
      const targetsWithDistance = availableTargets.map(target => ({
        project: target,
        distance: calculateDistance(project.latitude!, project.longitude!, target.latitude!, target.longitude!)
      })).sort((a, b) => b.distance - a.distance);
      const connectionsToMake = Math.min(maxConnectionsPerProject, targetsWithDistance.length);
      for (let i = 0; i < connectionsToMake; i++) {
        const targetData = targetsWithDistance[i];
        if (targetData && !usedAsTarget.has(targetData.project.project_title)) {
          newConnections.push({
            from: [project.longitude, project.latitude], // MapLibre uses [lng, lat]
            to: [targetData.project.longitude!, targetData.project.latitude!],
            from_project_indirect_beneficiaries: project.indirect_beneficiaries || 1000,
            from_project_direct_beneficiaries: project.direct_beneficiaries || 1000,
          });
          usedAsTarget.add(targetData.project.project_title);
        }
      }
    });
    return newConnections;
  }, [projects, isMobile]);
  
  useEffect(() => {
    const connections = generateConnections();
    setDynamicConnections(connections);
  }, [generateConnections, projects]); // Added projects dependency
  
  const createPopupHTML = useCallback((project: ProjectData) => {
    // ... (logic to create HTML string for marker popups, including project details and styling) ...
    // This function is detailed and creates rich HTML content for popups.
    return `<div>...</div>`; // Simplified for brevity
  }, []);

  // useEffect to initialize markers on the map.
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !projects) return;
    const map = mapRef.current;
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    projects.forEach(project => {
      if (project.latitude && project.longitude) {
        const el = document.createElement('div');
        // ... (Styling for custom marker element based on project properties, e.g., color, size) ...
        // Example: el.style.backgroundColor = getProjectColorByBeneficiaries(project.direct_beneficiaries);
        
        const marker = new (window as any).maplibregl.Marker(el)
          .setLngLat([project.longitude, project.latitude])
          .setPopup(new (window as any).maplibregl.Popup({ offset: 25, closeButton: false, className: 'custom-map-popup' })
            .setHTML(createPopupHTML(project)))
          .addTo(map);
        markersRef.current.push(marker);
      }
    });
  }, [isMapLoaded, projects, createPopupHTML]);

  // useEffect to initialize connection lines on the map.
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || dynamicConnections.length === 0) return;
    const map = mapRef.current;
    // ... (Logic to remove previous connection layers/sources using connectionsRef.current)

    dynamicConnections.forEach((connection, index) => {
      const connectionId = `connection-${index}`;
      // ... (Logic to add GeoJSON source and line layer to MapLibre for each connection)
      // Example: map.addLayer({ id: connectionId, type: 'line', source: { type: 'geojson', data: geojsonFeature }, layout: {}, paint: { ... } });
      connectionsRef.current.push({ id: connectionId });
    });
  }, [isMapLoaded, dynamicConnections]);

  // useEffect for particle animation along connection lines.
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || dynamicConnections.length === 0) {
      // ... (cleanup existing particles and animation frame)
      return;
    }
    const map = mapRef.current;
    const currentParticles: Particle[] = [];
    // ... (Logic to create particle DOM elements for each connection and add to map overlay)
    
    const animate = () => {
      // ... (Logic to update particle positions along their connection path using map.project/unproject)
      // This involves calculating points along the great circle arc for curved lines on the globe.
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => { /* cleanup: cancelAnimationFrame, remove particle elements */ };
  }, [isMapLoaded, dynamicConnections]);

  // useEffect to handle the HexGrid layer.
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current) return;
    const map = mapRef.current;
    const layerId = "hexGridLayer";
    const sourceId = "hexGridSource";

    if (showHexGrid) {
      // ... (Logic to add a GeoJSON source for hex data and a fill/line layer for the hex grid)
      // This might fetch hex data or use a pre-defined GeoJSON.
    } else {
      // ... (Logic to remove hex grid layer and source if they exist)
    }
  }, [isMapLoaded, showHexGrid]);

  return (
    <div className="relative w-full h-screen">
      <div ref={containerRef} className="w-full h-full" />
      {isMapLoaded && <GlobalStats projects={projects} isGlobeView={true} />}
    </div>
  );
}
```

**Summary of `components/globe-component.tsx`:**

*   **3D Globe Rendering**: Uses MapLibre GL JS to render an interactive 3D globe. The map style is satellite imagery from MapTiler, and the projection is set to `globe`.
*   **Dynamic MapLibre Import**: `maplibre-gl` is imported dynamically within `useEffect` to ensure it only runs on the client side. Its CSS is also dynamically appended to the document head via a `<link>` tag.
*   **Project Markers**: Displays `projects` as custom HTML markers on the globe. Each marker has a popup with detailed project information, styled using `createPopupHTML`.
*   **Connection Lines**: Generates and draws lines (connections) between projects. The connection logic connects projects to their most distant counterparts based on the Haversine formula, with limits on connections per project and a smaller processing set on mobile devices to optimize performance.
*   **Particle Animations**: Implements a particle animation effect along the connection lines. This involves creating DOM elements for particles and animating their positions using `requestAnimationFrame` and map projection/unprojection calculations to follow the curve of the globe.
*   **Hex Grid Layer**: Includes logic to display a hexagonal grid overlay on the globe, controlled by the `showHexGrid` prop. This is implemented as a GeoJSON layer in MapLibre.
*   **Resource Management**: Features a `cleanupResources` function and comprehensive cleanup operations in `useEffect` return statements to remove markers, layers, sources, and cancel animations, preventing memory leaks.
*   **Responsive Design**: Utilizes `useMediaQuery` to adjust behavior (e.g., initial zoom, number of connections) for mobile devices.
*   **UI Overlays**: Renders the `GlobalStats` component over the map to display project statistics.

**Overall Assessment:**

This is a very complex and feature-rich component, demonstrating advanced usage of MapLibre GL JS for 3D globe visualization. 
*   The dynamic loading, robust resource cleanup, and responsive adaptations are excellent practices.
*   The combination of custom HTML markers, popups, animated connection lines with particles, and a hex grid layer creates a visually engaging and informative experience.
*   The use of `useCallback` for memoizing functions passed to effects or event handlers is appropriate.

**Key Dependencies/Interactions:**

*   `maplibre-gl` library (imported as `(window as any).maplibregl` in marker creation, suggesting it might also be available globally after dynamic import).
*   `@/hooks/use-media-query`.
*   `@/lib/types` (for `ProjectData`).
*   `@/lib/colors` (e.g., `getProjectColorByBeneficiaries` used for marker styling, though not explicitly shown in the provided snippet for marker creation, it's imported and typical for such components).
*   `@/components/global-stats`.
*   Environment variable: `NEXT_PUBLIC_MAPTILER_API_KEY`.

**Recommendations for `components/globe-component.tsx`:**

*   **Performance**: Given the numerous features (markers, animated lines, particles, hex grid), performance should be a key consideration.
    *   **Particle Animation**: DOM-based particle animation can be resource-intensive. For many particles/connections, consider WebGL-based particle systems (if MapLibre doesn't offer a native solution, a separate library or custom WebGL layer might be needed) if performance issues arise.
    *   **Hex Grid**: If the hex grid GeoJSON is large or complex, its rendering could be demanding. Ensure it's optimized (e.g., simplification, appropriate zoom level visibility).
    *   **MapLibre Layers & Sources**: Frequent adding/removing of layers and sources for connections and the hex grid should be benchmarked. Sometimes, updating data in existing sources and toggling layer visibility can be more performant than full removal and re-addition.
    *   **Thorough testing** on various devices, especially mobile, is crucial.
*   **MapLibre CSS**: Dynamically appending the MapLibre CSS via a `<link>` tag in `useEffect` is a valid method. Ensure it loads reliably before the map attempts to render to prevent unstyled content flashes.
*   **Type Assertion for Projection**: `mapRef.current.setProjection({ type: 'globe' } as any)` uses `as any`. If MapLibre's type definitions offer a more precise type for projection options, it should be used to improve type safety.
*   **Error Handling**: The `initializeMap` function has a basic `catch` block. Consider more robust error handling for runtime errors within MapLibre event handlers or animation loops, potentially using error boundaries or more specific error logging.
*   **Modularity**: Due to its significant size and complexity, consider breaking down parts of the logic (e.g., particle system management, hex grid layer controller, connection generation) into separate custom hooks or smaller sub-components. This would enhance readability, maintainability, and testability.
*   **Global `maplibregl` Access**: The use of `(window as any).maplibregl` for creating markers and popups suggests that the `maplibregl` object loaded by dynamic import might also be attaching itself to the `window` object, or there's an assumption it's globally available. While this can work, explicitly passing the `maplibreglPackage` object (obtained from `await import('maplibre-gl')`) or the `map` instance to functions that need it would be a cleaner and more reliable approach, avoiding reliance on global scope.
*   **Console Logs**: Remove or manage `console.error` and other logs for production builds.

### `components/map-controls.tsx`

This component renders a set of user interface controls for interacting with both the Leaflet map and the MapLibre globe views. It includes functionality for searching projects, toggling the hexagonal grid, managing fullscreen mode, displaying a color legend based on project beneficiaries, and showing a list of all projects. It also provides a button to switch between the 2D map and 3D globe views.

```tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Layers, Grid, X, Maximize, Minimize, Search, ArrowRight, MapPin, List, Globe, Palette } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useMediaQuery } from "@/hooks/use-media-query"
import L from "leaflet" // Leaflet is imported for map navigation, but only used if not in globe view.
import { ProjectData } from "@/lib/types"
import { allProjectsData } from "@/lib/project-data" // Static project data source.
import Link from "next/link"

// Define color constants for the legend
const COLOR_BLUE = "#3b82f6";
const COLOR_GREEN = "#22c55e";
const COLOR_YELLOW = "#eab308";
const COLOR_RED = "#ef4444";
const COLOR_DEFAULT = "#a855f7";

interface LegendItem {
  color: string;
  label: string;
  description: string;
}

const legendItems: LegendItem[] = [
  // ... (legend items definition based on beneficiary counts)
];

interface MapControlsProps {
  onToggleHexGrid?: () => void;
  showHexGrid?: boolean;
  isGlobeView?: boolean;
  // mapInstance?: L.Map | null; // This prop was commented out or removed in the latest version
}

export function MapControls({ onToggleHexGrid, showHexGrid, isGlobeView = false }: MapControlsProps) {
  const [showInfo, setShowInfo] = useState(false) // For an info panel, not fully implemented in snippet.
  const [fullscreen, setFullscreen] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showAllProjects, setShowAllProjects] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<ProjectData[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [lastUpdatedDate, setLastUpdatedDate] = useState("");
  const [showLegend, setShowLegend] = useState(false);
  const dateInitializedRef = useRef(false); // To prevent double execution in dev strict mode.

  // Effect to set last updated date once on mount.
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && dateInitializedRef.current) return;
    dateInitializedRef.current = true;
    setLastUpdatedDate(new Date().toLocaleDateString());
  }, []);

  // Effect to focus search input when the search panel is shown.
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearch])

  // Effect to handle search logic based on searchQuery or showAllProjects state.
  useEffect(() => {
    if (searchQuery.length > 1) {
      const query = searchQuery.toLowerCase().trim()
      const results = allProjectsData.filter(project => 
        project.project_title.toLowerCase().includes(query) || 
        project.country_province.toLowerCase().includes(query)
      )
      setSearchResults(results)
      setShowAllProjects(false) // Clear showAllProjects if a search query is active
    } else if (showAllProjects) {
      setSearchResults([...allProjectsData].sort((a, b) => a.project_title.localeCompare(b.project_title)))
    } else {
      setSearchResults([])
    }
  }, [searchQuery, showAllProjects])

  // Function to toggle fullscreen mode for the document.
  const toggleFullscreen = () => { /* ... (implementation using document.documentElement.requestFullscreen) ... */ };

  // Function to navigate the Leaflet map to a specific lat/lng.
  // This function attempts to find the Leaflet map instance on the page.
  const navigateToLocation = (lat: number, lng: number) => {
    if (isGlobeView) {
        console.warn("navigateToLocation is intended for Leaflet map view, not globe view.");
        // Potentially add logic here to navigate the globe view if mapRef.current is accessible
        // from GlobeComponent and a navigation method is exposed.
        return;
    }
    try {
      const mapContainer = document.querySelector(".leaflet-container");
      if (!mapContainer) return;
      // @ts-expect-error - Bypassing strict type checks to access Leaflet's internal map instance.
      const map = L.DomUtil.getLeafletElement?.(mapContainer) || mapContainer._leaflet_map || window.leafletMap;
      if (map && typeof map.setView === 'function') {
        map.setView([lat, lng], 6, { animate: true });
        setShowSearch(false);
        setSearchQuery("");
        setShowAllProjects(false);
      } else { /* ... */ }
    } catch (error) { /* ... */ }
  }
  
  const toggleAllProjects = () => { /* ... (toggles showAllProjects state) ... */ };
  const toggleLegend = () => { /* ... (toggles showLegend state) ... */ };

  return (
    <>
      {/* Main controls container (Search, Hex Grid, Legend, Fullscreen, View Toggle) */}
      <div className={`absolute ${isMobile ? "top-20 left-4" : "top-20 right-4"} z-[500] flex flex-col gap-2`}>
        {/* Search Button & Tooltip */}
        {/* Hex Grid Toggle Button & Tooltip (uses onToggleHexGrid prop) */}
        {/* Color Legend Toggle Button & Tooltip */}
        {/* Fullscreen Toggle Button & Tooltip */}
        {/* Globe/Map View Toggle Button & Tooltip (using Next.js Link) */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={isGlobeView ? "/" : "/globe"} passHref legacyBehavior>
                <Button /* ... styling ... */ >
                  {isGlobeView ? <MapPin className="h-5 w-5" /> : <Globe className="h-5 w-5" />}
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side={isMobile ? "right" : "left"}>
              <p>{isGlobeView ? "Switch to 2D Map" : "Switch to 3D Globe"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Search Panel (conditionally rendered) */}
      {showSearch && (
        <div className={`absolute ${isMobile ? "top-16 left-0 w-full p-4" : "top-4 left-1/2 -translate-x-1/2 w-1/2 max-w-2xl"} z-[1000] bg-black/80 backdrop-blur-md p-4 rounded-lg shadow-2xl`}>
          {/* ... (Search input, close button, 'Show All Projects' button) ... */}
          {/* Search Results List */}
          <div className="mt-4 max-h-[60vh] overflow-y-auto styled-scrollbar">
            {searchResults.map(project => (
              <div key={project.id} /* ... styling ... */ onClick={() => navigateToLocation(project.latitude, project.longitude)}>
                {/* ... (Project title, country, arrow icon) ... */}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Color Legend Panel (conditionally rendered) */}
      {showLegend && (
        <div className={`absolute ${isMobile ? "bottom-20 left-4" : "bottom-4 left-4"} z-[500] bg-black/80 backdrop-blur-md p-4 rounded-lg shadow-lg w-64`}>
          {/* ... (Legend title, close button, list of legend items with color swatches and labels) ... */}
        </div>
      )}
      
      {/* Footer Info (Last Updated Date) */}
      <div className={`absolute ${isMobile ? "bottom-2 left-1/2 -translate-x-1/2" : "bottom-4 right-4"} z-[400] text-xs text-neutral-500 select-none`}>
        Last Updated: {lastUpdatedDate}
      </div>
    </>
  )
}
```

**Summary of `components/map-controls.tsx`:**

*   **Purpose**: Provides a unified set of controls for both the 2D Leaflet map and the 3D MapLibre globe views.
*   **Controls Offered**:
    *   **Search**: Allows users to search for projects by title or country/province. Displays results in a panel, and clicking a result calls `navigateToLocation`.
    *   **Show All Projects**: A button within the search panel to list all projects, sorted alphabetically.
    *   **Hex Grid Toggle**: Toggles the visibility of a hexagonal grid overlay via the `onToggleHexGrid` prop. The icon changes between `Layers` and `Grid`.
    *   **Color Legend**: Toggles a panel displaying a legend that explains the color-coding of projects (presumably based on the number of beneficiaries).
    *   **Fullscreen Mode**: Toggles fullscreen for the application window.
    *   **View Switcher**: A button (using Next.js `Link`) to navigate between the 2D map view (`/`) and the 3D globe view (`/globe`). The icon changes between `MapPin` and `Globe`.
*   **State Management**: Uses `useState` for managing the visibility of panels (search, legend), search query, search results, fullscreen state, and the last updated date.
*   **Effects**: 
    *   `useEffect` to set the `lastUpdatedDate` once on mount.
    *   `useEffect` to focus the search input field when the search panel is shown.
    *   `useEffect` to perform project search based on `searchQuery` or display all projects if `showAllProjects` is true.
*   **`navigateToLocation` Function**: 
    *   This function is primarily designed for the Leaflet map. It attempts to find the Leaflet map instance on the page (using various methods, including accessing internal Leaflet properties via `@ts-expect-error`) and then calls `map.setView()`.
    *   It includes a check for `isGlobeView` to prevent execution in globe mode, but navigation for the globe itself is not implemented within this function.
*   **Styling & UI**: Uses Shadcn UI components (`Button`, `Input`, `Tooltip`) and Lucide icons. The controls are positioned absolutely on the screen, with different positioning for mobile vs. desktop using `useMediaQuery`.
*   **Data**: Imports `allProjectsData` directly to perform client-side searching.

**Overall Assessment:**

*   This is a comprehensive control panel that offers good interactivity for the map/globe features.
*   The client-side search on `allProjectsData` is suitable for a moderate number of projects but might become slow with very large datasets.
*   The method for accessing the Leaflet map instance in `navigateToLocation` is a bit fragile as it relies on DOM queries and potentially internal/undocumented Leaflet properties. Passing the map instance as a prop (as was perhaps intended with the commented-out `mapInstance` prop) would be a more robust solution if feasible with the `ClientMapWrapper`'s dynamic loading.
*   The UI is responsive and uses tooltips for better UX.

**Key Dependencies/Interactions:**

*   Shadcn UI components (`Button`, `Input`, `Tooltip`).
*   `lucide-react` for icons.
*   `@/hooks/use-media-query`.
*   `@/lib/types` (`ProjectData`).
*   `@/lib/project-data` (`allProjectsData`).
*   `leaflet` (conditionally for navigation).
*   Props: `onToggleHexGrid`, `showHexGrid`, `isGlobeView`.

**Recommendations for `components/map-controls.tsx`:**

*   **`navigateToLocation` for Globe**: If globe navigation from search results is desired, a mechanism to communicate with `GlobeComponent` (e.g., via a callback prop, context, or event bus) would be needed to trigger its navigation logic.
*   **Map Instance Access**: Revisit how the Leaflet map instance is accessed. If `ClientMapWrapper` can expose the map instance (e.g., via a ref or a callback prop once initialized), `MapControls` could receive it directly, making `navigateToLocation` more reliable and type-safe.
*   **State for `showInfo`**: The `showInfo` state variable is declared but not used in the provided snippet. If it's intended for a feature, it should be implemented or removed.
*   **Search Performance**: For very large datasets, consider debouncing the search input or exploring server-side search/filtering if `allProjectsData` becomes too large to efficiently filter on the client.
*   **Code Clarity**: The `navigateToLocation` function could be simplified if a more direct way to access the map instance is implemented. The multiple fallbacks for finding the map instance indicate a workaround for an awkward inter-component communication.

---

### `components/map/map-controller.tsx`

This client-side component is designed to manage and control various aspects of a Leaflet map instance within a React application, using the `react-leaflet` library. It handles map constraints (bounds, zoom behavior), initial view settings, and responsive adjustments on window resize.

```tsx
"use client"

import { useEffect, useCallback, useRef } from "react"
import { useMap } from "react-leaflet" // Hook to get the Leaflet map instance.
import L from "leaflet" // Leaflet library.
import { useMediaQuery } from "@/hooks/use-media-query" // Hook for responsive design.

export function MapController() {
  const map = useMap() // Get the current Leaflet map instance.
  const isMobile = useMediaQuery("(max-width: 768px)") // Check for mobile screen size.
  const initializedRef = useRef(false) // Ref to track if initial setup has run.
  
  // Callback to set up map constraints like zoom behavior and boundaries.
  const setupMapConstraints = useCallback(() => {
    if (!map) return
    
    // Adjust zoom snap and delta for mobile for potentially smoother interaction.
    map.options.zoomSnap = isMobile ? 0.5 : 0.1
    map.options.zoomDelta = isMobile ? 0.5 : 0.5 // Note: zoomDelta is 0.5 for both, perhaps intentional or a typo if different behavior was desired.

    // Define geographical bounds to restrict map panning.
    const southWest = L.latLng(-85, -180) // Roughly covers most of the world map.
    const northEast = L.latLng(75, 180) 
    const bounds = L.latLngBounds(southWest, northEast)
    
    map.setMaxBounds(bounds) // Apply the maximum bounds to the map.
    
    // Set the initial view of the map (center [0,0], zoom 2) only once.
    if (!initializedRef.current) {
      map.setView([0, 0], 2) 
      initializedRef.current = true
    }
    
    return bounds; // Return the created bounds for potential use elsewhere.
  }, [map, isMobile]);

  // Main effect hook to apply constraints and event listeners.
  useEffect(() => {
    // Handle React StrictMode's double invocation in development by skipping the first run if not yet initialized.
    if (process.env.NODE_ENV === 'development' && !initializedRef.current) {
      initializedRef.current = true; // Mark as initialized for the actual second run.
      return () => {}; // No cleanup needed for the skipped first run.
    }
    
    const bounds = setupMapConstraints(); // Execute constraint setup.
    if (!bounds || !map) return () => {}; // Exit if map or bounds are not ready.
    
    // Debounced bounds checking on map drag to ensure the view stays within maxBounds.
    let boundsCheckTimeout: number | null = null
    const checkBounds = () => {
      if (boundsCheckTimeout) clearTimeout(boundsCheckTimeout)
      boundsCheckTimeout = window.setTimeout(() => {
        map.panInsideBounds(bounds, { animate: false }) // Gently pans back into bounds.
      }, 100) // 100ms debounce.
    }
    map.on('drag', checkBounds) // Listen to drag events.

    // Debounced resize handler to adjust map view on window resize.
    let resizeTimeout: number | null = null
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout)
      resizeTimeout = window.setTimeout(() => {
        try {
          const currentCenter = map.getCenter()
          const currentZoom = map.getZoom() || 2 // Fallback zoom level.
          
          // On mobile, potentially reduce zoom to ensure content fits.
          if (window.innerWidth <= 768) {
            map.setView(currentCenter, Math.min(currentZoom, 2))
          } else {
            map.setView(currentCenter, currentZoom) // Maintain current zoom on desktop.
          }
        } catch {
          // Fallback if map state is somehow not readable.
          console.warn("Map not ready during resize, setting default view")
          map.setView([0, 0], 2)
        }
      }, 200) // 200ms debounce.
    }

    window.addEventListener("resize", handleResize)

    // Cleanup function for when the component unmounts or dependencies change.
    return () => {
      window.removeEventListener("resize", handleResize)
      map.off('drag', checkBounds)
      if (boundsCheckTimeout) clearTimeout(boundsCheckTimeout) // Clear any pending timeouts.
      if (resizeTimeout) clearTimeout(resizeTimeout)
    }
  }, [map, setupMapConstraints]) // Dependencies: map instance and the memoized setup function.

  return null // This component does not render any visible UI itself.
} 
```

**Summary of `components/map/map-controller.tsx`:**

*   **Purpose**: Acts as a controller for a `react-leaflet` map, managing its behavior and responsiveness.
*   **Map Initialization**: Uses `useMap()` to get the Leaflet map instance.
*   **Constraints**: 
    *   Sets `zoomSnap` and `zoomDelta` (differently for mobile, though `zoomDelta` is the same value for both in the code, which might be a point to review).
    *   Defines and applies maximum geographical bounds (`setMaxBounds`) to prevent users from panning too far off the main world map area.
    *   Sets an initial view (`setView([0,0], 2)`) once upon initialization.
*   **Responsive Behavior**:
    *   Uses `useMediaQuery` to detect mobile devices.
    *   Attaches a debounced event listener to window `resize` events. On resize, it re-centers the map and adjusts the zoom level (potentially reducing it on mobile if the current zoom is greater than 2).
*   **Drag Handling**: Attaches a debounced event listener to map `drag` events. When the user drags the map, `panInsideBounds` is called to ensure the view stays within the defined maximum bounds.
*   **Development Mode Handling**: Includes a check for `process.env.NODE_ENV === 'development'` and uses a `useRef` flag (`initializedRef`) to correctly handle React StrictMode's double effect invocation during development, ensuring initialization logic runs effectively once.
*   **No UI Rendering**: The component returns `null` as its purpose is purely to control the map programmatically.

**Overall Assessment:**

*   This is a well-structured controller component that centralizes important map management logic.
*   The use of `useCallback` for `setupMapConstraints` and debouncing for `drag` and `resize` event handlers are good practices for performance.
*   The handling of React StrictMode's double effect invocation is thoughtful.
*   The responsive adjustments for zoom and view on mobile are good for UX.

**Key Dependencies/Interactions:**

*   `react-leaflet` (specifically `useMap`).
*   `leaflet` library.
*   `@/hooks/use-media-query`.

**Recommendations for `components/map/map-controller.tsx`:**

*   **`zoomDelta` Configuration**: Review `map.options.zoomDelta = isMobile ? 0.5 : 0.5;`. If different zoom delta behaviors were intended for mobile vs. desktop, the desktop value needs to be different. If 0.5 is desired for both, the conditional assignment is redundant.
*   **Error Handling in Resize**: The `catch` block in `handleResize` logs a warning and sets a default view. This is a reasonable fallback, but ensure it doesn't mask underlying issues if the map frequently becomes unreadable during resize.
*   **Initial Zoom**: The initial zoom is set to 2. This could be made configurable via props if different initial states are needed elsewhere in the application.
*   **Code Clarity**: The `initializedRef` is used for two slightly different purposes: preventing re-initialization of `map.setView` in `setupMapConstraints` and managing the StrictMode double effect call. While it works, consider if separating these concerns with different refs or a more explicit state machine could improve clarity for future maintainers, though the current approach is concise.

---

### `components/map/optimized-tile-layer.tsx`

This client-side component provides an optimized tile layer for a `react-leaflet` map. It extends the basic Leaflet tile layer with several performance enhancements, including deferred updates, tile buffering, prefetching adjacent tiles, and CSS-based progressive loading effects.

```tsx
"use client"

import { useEffect, useRef } from "react"
import L from "leaflet" // Leaflet library.
import { useMap } from "react-leaflet" // Hook to get the Leaflet map instance.

interface OptimizedTileLayerProps {
  url: string // URL template for the tile server.
  attribution: string // Attribution text for the tile provider.
  crossOrigin?: boolean | 'anonymous' | 'use-credentials' // crossOrigin setting for tile requests.
  maxZoom?: number // Maximum zoom level for the layer.
  subdomains?: string // Subdomains to use for tile requests (e.g., "abc").
}

export function OptimizedTileLayer({ 
  url, 
  attribution, 
  crossOrigin = 'anonymous',
  maxZoom = 18, // Default maxZoom if not provided.
  subdomains = "abc" // Default subdomains if not provided.
}: OptimizedTileLayerProps) {
  const map = useMap() // Get the Leaflet map instance.
  const tileLayerRef = useRef<L.TileLayer | null>(null) // Ref to store the tile layer instance.

  useEffect(() => {
    if (!map || !url) return // Ensure map and URL are available.

    // Create a custom Leaflet tile layer with several optimization options.
    const tileLayer = L.tileLayer(url, {
      attribution,
      crossOrigin,
      maxZoom,
      subdomains,
      // Optimization settings:
      updateWhenIdle: true,     // Only load new tiles when panning/zooming stops and the map is idle.
      updateWhenZooming: false, // Prevents loading tiles during the zoom animation, updates after zoom ends.
      keepBuffer: 2,            // Number of rows/columns of tiles to keep in memory around the visible area.
      maxNativeZoom: 19,        // Specifies the maximum zoom level at which the tiles are available from the server. Tiles for zoom levels higher than this will be overscaled from this zoom level.
      className: "optimized-tile", // Custom class for styling individual tiles.
    })

    tileLayer.addTo(map) // Add the configured tile layer to the map.
    tileLayerRef.current = tileLayer // Store the layer instance.

    // Function to prefetch tiles in an expanded bounding box around the current view.
    const prefetchAdjacentTiles = () => {
      if (!tileLayer || !map) return
      
      const bounds = map.getBounds() // Get current map bounds.
      
      // Slightly expand the current bounds (by 20% in each direction) to define the prefetching area.
      const expandedBounds = bounds.pad(0.2) 
      // This line seems to intend to set the bounds for the tile layer itself for prefetching, 
      // however, Leaflet's L.TileLayer does not directly use an `options.bounds` for prefetching in this manner.
      // Prefetching is typically managed by how `keepBuffer` works and how the browser caches tile requests.
      // This specific line might not have the intended effect for prefetching beyond the keepBuffer strategy.
      tileLayer.options.bounds = expandedBounds 
    }

    // Set up event listeners to trigger prefetching when map movement or zoom ends.
    map.on('moveend', prefetchAdjacentTiles)
    map.on('zoomend', prefetchAdjacentTiles)

    // Dynamically add CSS for progressive tile loading effects (fade-in).
    const style = document.createElement('style')
    style.innerHTML = `
      .optimized-tile {
        will-change: transform; /* Hint for browser optimization */
        transform: translateZ(0); /* Promote to its own compositing layer */
        backface-visibility: hidden; /* Hide backface during transforms */
        perspective: 1000px; /* For 3D transforms, though not directly used here */
        transition: opacity 0.2s ease-out; /* Smooth opacity transition */
      }
      .leaflet-tile-loaded {
        opacity: 1; /* Fully visible when loaded */
      }
      .leaflet-tile-loading {
        opacity: 0; /* Initially invisible while loading */
      }
    `
    document.head.appendChild(style) // Add the style element to the document head.

    // Cleanup function for when the component unmounts or dependencies change.
    return () => {
      if (map && tileLayer) {
        map.removeLayer(tileLayer) // Remove the tile layer from the map.
        map.off('moveend', prefetchAdjacentTiles) // Remove event listeners.
        map.off('zoomend', prefetchAdjacentTiles)
      }
      // Remove the dynamically added style element to prevent style accumulation if the component re-mounts.
      if (style && document.head.contains(style)) {
         document.head.removeChild(style)
      }
    }
  }, [url, attribution, crossOrigin, maxZoom, subdomains, map]) // Effect dependencies.

  return null // This component does not render any visible UI itself.
} 
```

**Summary of `components/map/optimized-tile-layer.tsx`:**

*   **Purpose**: Provides a Leaflet tile layer with enhanced performance characteristics for `react-leaflet` maps.
*   **Optimization Features**: 
    *   `updateWhenIdle: true`: Tiles are loaded only after map movement (panning) ceases.
    *   `updateWhenZooming: false`: Tiles are not loaded during zoom animations, only after the zoom action completes.
    *   `keepBuffer: 2`: Keeps a larger buffer of tiles (2 rows/columns around the viewport) in memory to reduce perceived loading times when panning small distances.
    *   `maxNativeZoom: 19`: Sets the cap for native zoom levels from the tile server, potentially reducing requests for non-existent higher zoom tiles.
*   **Prefetching Attempt**: Implements a `prefetchAdjacentTiles` function triggered on `moveend` and `zoomend`. This function attempts to expand the current map bounds and assign it to `tileLayer.options.bounds`. However, standard Leaflet `L.TileLayer` does not use `options.bounds` for dynamic prefetching in this manner. The actual prefetching behavior is more governed by `keepBuffer` and browser caching.
*   **Progressive Loading CSS**: Dynamically injects CSS to create a fade-in effect for tiles as they load (`.leaflet-tile-loading` starts at `opacity: 0`, `.leaflet-tile-loaded` transitions to `opacity: 1`). This improves the visual experience by masking the tile loading process.
    *   The CSS also includes common performance hints like `will-change: transform`, `transform: translateZ(0)`, and `backface-visibility: hidden` for the `optimized-tile` class applied to individual tiles.
*   **Props**: Accepts standard tile layer props like `url`, `attribution`, `crossOrigin`, `maxZoom`, and `subdomains`.
*   **Lifecycle Management**: Adds the tile layer to the map on mount and cleans it up (removes layer, event listeners, and injected styles) on unmount.

**Overall Assessment:**

*   This component demonstrates a good effort to optimize tile layer performance in Leaflet.
*   The `updateWhenIdle`, `updateWhenZooming`, and `keepBuffer` options are standard and effective Leaflet optimizations.
*   The CSS for progressive loading is a nice touch for UX.
*   The `prefetchAdjacentTiles` logic, specifically the `tileLayer.options.bounds = expandedBounds` line, might not be functioning as intended for prefetching, as this is not a standard mechanism for Leaflet to prefetch tiles beyond what `keepBuffer` and browser caching provide. Leaflet doesn't dynamically reload or prefetch based on a changed `options.bounds` after initialization in this way.

**Key Dependencies/Interactions:**

*   `react-leaflet` (specifically `useMap`).
*   `leaflet` library.

**Recommendations for `components/map/optimized-tile-layer.tsx`:**

*   **Review `prefetchAdjacentTiles`**: The utility of setting `tileLayer.options.bounds = expandedBounds` for prefetching should be verified. If it doesn't contribute to prefetching beyond `keepBuffer`, it could be removed to simplify the code. Modern browsers are quite good at caching tiles, and `keepBuffer` helps with immediate panning.
*   **`maxNativeZoom` vs `maxZoom`**: Ensure the distinction and interaction between `maxZoom` (maximum zoom the layer will display, potentially overzooming) and `maxNativeZoom` (maximum zoom available from the tile server) are clearly understood and configured appropriately for the chosen tile service.
*   **Style Injection**: Dynamically injecting CSS via `document.createElement('style')` works but can sometimes be less manageable than using CSS Modules, styled-components, or Tailwind CSS (if tile-specific styles are complex). For this limited scope, it's acceptable. Ensure the cleanup (`removeChild(style)`) is robust, especially if multiple instances of this layer could exist.
*   **Performance of Event Handlers**: While `moveend` and `zoomend` are generally fine, for very complex `prefetchAdjacentTiles` logic (if it were doing more intensive calculations), debouncing might be considered, though it's likely unnecessary for the current implementation.

---

</rewritten_file>