# Tenant Theming System Guide

This document provides guidance on how to use and customize the theme system in the Sport App.

## Overview

The theming system is designed to be simple yet powerful. It's based on a single primary color (via hue and saturation) that generates a complete palette of 10 shades. This approach ensures visual consistency and makes it very easy to customize the entire app's look and feel by changing just one or two variables.

## How It Works

1. The system uses CSS variables defined in `globals.css` and exposed through Tailwind's configuration.
2. All colors are derived from a single `--brand-hue` and `--brand-saturation` value.
3. We generate 10 shades of the primary color (from 50 to 900) which can be used throughout the app.
4. UI elements are mapped to these shades for consistency.

## Using Theme Colors in Components

### Basic Usage

Use the primary color scale directly:

```tsx
<div className="bg-primary-100 text-primary-700">
  Light background with darker text
</div>

<button className="bg-primary text-primary-foreground">
  Primary button
</button>
```

### Semantic Colors

We provide semantic colors that automatically adapt to the theme:

- `primary` - The main brand color
- `secondary` - A lighter alternative
- `accent` - For highlighting or accents
- `muted` - For subtle UI elements
- `card` - For card backgrounds
- `popover` - For popover elements
- `destructive` - For error states

Each has a corresponding `-foreground` color for optimal contrast.

## Customizing for Tenants

To customize the theme for different tenants, use the `setTenantTheme` utility:

```tsx
import { setTenantTheme } from "@/lib/utils";

// Set theme to purple (hue: 260)
setTenantTheme(260, 70);

// Set theme to teal (hue: 175)
setTenantTheme(175, 70);
```

## CSS Variables Reference

Here are the key CSS variables you can use:

- `--brand-hue` - The base hue value (0-360)
- `--brand-saturation` - The saturation percentage
- `--primary-{50-900}` - The generated primary color shades
- `--primary` - The main accent color
- `--secondary` - Secondary UI elements
- `--accent` - Accent highlights
- `--background` - Page background
- `--foreground` - Text color for the background
- `--sidebar` - Sidebar background color
- `--sidebar-foreground` - Text color for sidebar
- `--card` - Card background
- `--card-foreground` - Text color for cards

## Best Practices

1. **Consistency**: Use the predefined palette instead of arbitrary colors
2. **Hierarchy**: Use darker shades for more important elements
3. **Accessibility**: Ensure sufficient contrast between text and backgrounds
4. **White Space**: Use white/card backgrounds for content areas
5. **Tenant Customization**: Only change the hue and saturation, not individual colors

## Dark Mode

The theme automatically provides a dark mode that adjusts the lightness values while maintaining the same hue. This ensures a consistent brand identity across both light and dark themes.

To test dark mode, add the `dark` class to any parent element (or use the system-level dark mode detection).
