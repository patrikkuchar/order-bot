import {definePreset} from '@primeuix/themes';
import Lara from '@primeuix/themes/lara';

export const MyPreset = definePreset(Lara, {
  semantic: {
    // ---------------------------------------------------------
    // PRIMARY (deep blue-teal)
    // ---------------------------------------------------------
    primary: {
      50:  '#DCE7F1',
      100: '#B9D0E3',
      200: '#95B9D5',
      300: '#71A1C7',
      400: '#4D89B9',
      500: '#3E7CB1',
      600: '#2E638E',
      700: '#1F4A6B',
      800: '#13334A',
      900: '#0D2433',
      950: '#07131E'
    },

    // ---------------------------------------------------------
    // SECONDARY (petrol / aqua tint)
    // ---------------------------------------------------------
    secondary: {
      50:  '#F0F4FA',
      100: '#D9E3F2',
      200: '#B5C8E4',
      300: '#91ADD6',
      400: '#6C92C8',
      500: '#4A6FA5',   // hlavná secondary
      600: '#3D5A86',
      700: '#31456A',
      800: '#26334F',
      900: '#1A2033',   // dark header
      950: '#0E121F'    // dark menu
    },

    // ---------------------------------------------------------
    // SURFACE — modern clean neutral
    // ---------------------------------------------------------
    surface: {
      0:   '#FFFFFF',
      50:  '#F8F9FB',
      100: '#F0F1F5',
      200: '#E5E7EB',
      300: '#D0D3DA',
      400: '#A8ADB9',
      500: '#7C8291',
      600: '#525766',
      700: '#2E323E',
      800: '#1B1E26',
      900: '#111317',
      950: '#0A0B0D'
    },

    // ---------------------------------------------------------
    // COLOR SCHEMES
    // ---------------------------------------------------------
    colorScheme: {
      light: {
        primary: {
          color: '{primary.500}',
          inverseColor: '#ffffff',
          hoverColor: '{primary.600}',
          activeColor: '{primary.700}',
        },

        surface: {
          ground:  '{surface.100}',
          section: '{secondary.500}',   // HEADER LIGHT
          menu:    '{secondary.400}',   // MENU LIGHT
          card:    '{surface.0}',
          overlay: '{surface.0}',
          border:  '{surface.200}',
          hover:   '{surface.100}',
        },
      },

      dark: {
        primary: {
          color: '{primary.300}',
          inverseColor: '#ffffff',
          hoverColor: '{primary.200}',
          activeColor: '{primary.400}',
        },

        surface: {
          ground:  '{surface.800}',
          section: '{secondary.900}',   // HEADER DARK
          menu:    '{secondary.800}',   // MENU DARK
          card:    '{surface.800}',
          overlay: '{surface.800}',
          border:  '{surface.600}',
          hover:   '{surface.700}',
        },
      },
    },
  },
});
