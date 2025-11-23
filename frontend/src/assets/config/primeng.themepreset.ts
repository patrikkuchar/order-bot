import {definePreset} from '@primeuix/themes';
import Lara from '@primeuix/themes/lara';

export const MyPreset = definePreset(Lara, {
  semantic: {
    primary: {
      50: '#f6ff99',
      100: '#e8f7a8',
      200: '#d2f0a6',
      300: '#bbe9a2',
      400: '#a7e399',
      500: '#66c9a8',
      600: '#48b3af',
      700: '#489caf',
      800: '#4785ae',
      900: '#476eae',
      950: '#36508a',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.800}',
          inverseColor: '#ffffff',
          hoverColor: '{primary.900}',
          activeColor: '{primary.800}',
        },
        highlight: {
          background: '{primary.950}',
          focusBackground: '{primary.700}',
          color: '#ffffff',
          focusColor: '#ffffff',
        },
        surface: {
          // Sets the base page background; tune section/card/overlay if needed
          ground: '#F5F7FA',
          section: '#ffffff',
          card: '#ffffff',
          overlay: '#ffffff',
          border: '#dfe7c0',
          focusRing: 'color-mix(in srgb, {primary.color} 60%, transparent)',
        },
      },
      dark: {
        primary: {
          color: '{primary.800}',
          inverseColor: '{primary.50}',
          hoverColor: '{primary.700}',
          activeColor: '{primary.800}',
        },
        highlight: {
          background: 'rgba(250, 250, 250, .16)',
          focusBackground: 'rgba(250, 250, 250, .24)',
          color: 'rgba(255,255,255,.87)',
          focusColor: 'rgba(255,255,255,.87)',
        },
        surface: {
          // Sets the base page background; tune section/card/overlay if needed
          ground: '#111827',
          section: '#000000',
          card: '#000000',
          overlay: '#000000',
          border: '#1c2f5e',
          focusRing: 'color-mix(in srgb, {primary.color} 60%, transparent)',
        },
      },
    },
  }
});
