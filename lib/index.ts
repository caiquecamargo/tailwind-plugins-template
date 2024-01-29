import fs from 'node:fs';
import { withOptions } from 'tailwindcss/plugin';
import { getColors } from 'theme-colors';

interface PluginOptions {
  colors: Array<string>;
  cssPath?: string;
}

function readFile(cssPath: string): string {
  try {
    const file = fs.readFileSync(cssPath, 'utf-8');

    return file;
  }
  catch {
    throw new Error('The file does not exist');
  }
}

function extractCssVarValue(cssVar: string, cssPath: string): string {
  const file = readFile(cssPath);

  const cssVarRegex = new RegExp(`${cssVar}:\\s*([^;]+)`);
  const cssVarValue = file.match(cssVarRegex)?.[1];

  return cssVarValue ?? '';
}

function hexToRgb(hex: string): string {
  const hexValue = hex.replace('#', '');

  const r = Number.parseInt(hexValue.substring(0, 2), 16);
  const g = Number.parseInt(hexValue.substring(2, 4), 16);
  const b = Number.parseInt(hexValue.substring(4, 6), 16);

  return `${r} ${g} ${b}`;
}

function extractCssColorValue(color: string, cssPath: string): string {
  if (color.includes('var')) {
    const cssVar = color.match(/var\(([^)]+)\)/)?.[1];

    if (!cssVar)
      throw new Error('The color value is not a valid CSS variable');

    const cssVarValue = extractCssVarValue(cssVar, cssPath);

    return cssVarValue.split(' ').join(', ');
  }

  if (color.startsWith('#'))
    return color;

  if (color.startsWith('rgb')) {
    const rgb = color.match(/\d+/g);

    return rgb?.join(', ') ?? '';
  };

  return color;
}

function generateCssClass(className: string, colorName: string, gradient: string, opacity?: number) {
  const withOpacity = opacity ? `\\/${opacity}` : '';
  const classes = {
    text: `.${className}-${colorName}-${gradient}${withOpacity}`,
    bg: `.${className}-${colorName}-${gradient}${withOpacity}`,
    border: `.${className}-${colorName}-${gradient}${withOpacity}`,
    ring: `.${className}-${colorName}-${gradient}${withOpacity}`,
    divide: `.${className}-${colorName}-${gradient}${withOpacity} > :not([hidden]) ~ :not([hidden])`,
    placeholder: `.${className}-${colorName}-${gradient}${withOpacity}::placeholder`,
    from: `.${className}-${colorName}-${gradient}${withOpacity}`,
    via: `.${className}-${colorName}-${gradient}${withOpacity}`,
    to: `.${className}-${colorName}-${gradient}${withOpacity}`,
  };

  return classes[className as keyof typeof classes];
}

function generateCssValue(className: string, hexColor: string, opacity: number = 100) {
  const classes = {
    text: {
      color: `rgb(${hexToRgb(hexColor)} / ${opacity / 100})`,
    },
    bg: {
      'background-color': `rgb(${hexToRgb(hexColor)} / ${opacity / 100})`,
    },
    border: {
      'border-color': `rgb(${hexToRgb(hexColor)} / ${opacity / 100})`,
    },
    ring: {
      '--tw-ring-color': `rgb(${hexToRgb(hexColor)} / var(--tw-ring-opacity))`,
    },
    divide: {
      'border-color': `rgb(${hexToRgb(hexColor)} / ${opacity / 100})`,
    },
    placeholder: {
      color: `rgb(${hexToRgb(hexColor)} / ${opacity / 100})`,
    },
    from: {
      '--tw-gradient-from': `rgb(${hexToRgb(hexColor)} / ${opacity / 100}) var(--tw-gradient-from-position)`,
      '--tw-gradient-to': `rgb(${hexToRgb(hexColor)} / 0) var(--tw-gradient-to-position)`,
      '--tw-gradient-stops': `var(--tw-gradient-from), var(--tw-gradient-to)`,
    },
    via: {
      '--tw-gradient-to': `rgb(${hexToRgb(hexColor)} / 0)  var(--tw-gradient-to-position)`,
      '--tw-gradient-stops': `var(--tw-gradient-from), rgb(${hexToRgb(hexColor)} / ${opacity / 100}) var(--tw-gradient-via-position), var(--tw-gradient-to) !important`,
    },
    to: {
      '--tw-gradient-to': `rgb(${hexToRgb(hexColor)} / ${opacity / 100}) var(--tw-gradient-to-position) !important`,
    },
  };

  return classes[className as keyof typeof classes];
}

export default withOptions((options?: PluginOptions) => ({ addUtilities, theme }) => {
  const newUtilities = {} as Record<string, Record<string, string>>;

  const classes = ['text', 'bg', 'border', 'ring', 'divide', 'placeholder', 'from', 'via', 'to'];
  const opacities = Array.from({ length: 20 }, (_, i) => (i + 1) * 5);

  const themeColors = theme('colors');
  const colors = options?.colors || ['primary'];
  const cssPath = options?.cssPath || 'src/style.css';

  if (!themeColors)
    throw new Error('The theme does not have any colors');

  for (const color of colors) {
    const colorValue = themeColors[color] as string;

    const resolvedColorValue = extractCssColorValue(colorValue, cssPath);
    const gradients = getColors(resolvedColorValue);

    for (const [gradient, value] of Object.entries(gradients)) {
      for (const className of classes) {
        newUtilities[generateCssClass(className, color, gradient)] = generateCssValue(className, value);

        for (const opacity of opacities)
          newUtilities[generateCssClass(className, color, gradient, opacity)] = generateCssValue(className, value, opacity);
      }
    }
  }

  addUtilities(newUtilities);
});
