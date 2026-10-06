import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'terracotta',
  defaultRadius: 'md',
  fontFamily: '"Inter Tight", system-ui, sans-serif',
  headings: {
    fontFamily: '"Fraunces", serif',
    fontWeight: '300',
  },
  colors: {
    terracotta: [
      '#fbf1ed',
      '#f2dfd7',
      '#e3baaa',
      '#d5937a',
      '#ca7351',
      '#c25c35',
      '#be5024',
      '#a84018',
      '#963813',
      '#842d0b',
    ],
  },
  components: {
    AppShell: {
      styles: {
        main: {
          backgroundColor: '#F3EDDF',
        },
        header: {
          backgroundColor: '#F3EDDF',
          borderColor: 'rgba(0,0,0,0.12)',
        },
        navbar: {
          backgroundColor: '#F3EDDF',
          borderColor: 'rgba(0,0,0,0.12)',
        }
      }
    },
    Paper: {
      styles: {
        root: {
          backgroundColor: '#FCF6F0',
          borderColor: 'rgba(0,0,0,0.12)',
        },
      },
    },
    Card: {
      styles: {
        root: {
          backgroundColor: '#FCF6F0',
          borderColor: 'rgba(0,0,0,0.12)',
        },
      },
    },
    Input: {
      styles: {
        input: {
          backgroundColor: 'rgba(0,0,0,0.04)',
          borderColor: 'rgba(0,0,0,0.12)',
          borderRadius: '14px',
        }
      }
    }
  },
});
