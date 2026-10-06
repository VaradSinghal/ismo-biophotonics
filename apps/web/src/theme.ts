import { createTheme, rem } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'indigo',
  defaultRadius: 'md',
  fontFamily: 'Inter, system-ui, sans-serif',
  headings: {
    fontFamily: 'Outfit, system-ui, sans-serif',
    fontWeight: '700',
  },
  components: {
    Button: {
      defaultProps: {
        size: 'md',
      },
      styles: {
        root: {
          transition: 'all 0.2s ease',
        },
      },
    },
    Paper: {
      defaultProps: {
        shadow: 'sm',
        p: 'md',
      },
    },
    Card: {
      defaultProps: {
        shadow: 'sm',
        p: 'md',
        radius: 'md',
      },
    },
  },
  colors: {
    // Custom vibrant indigo palette
    indigo: [
      '#eef2ff',
      '#e0e7ff',
      '#c7d2fe',
      '#a5b4fc',
      '#818cf8',
      '#6366f1',
      '#4f46e5',
      '#4338ca',
      '#3730a3',
      '#312e81',
    ],
  },
});
