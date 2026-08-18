import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "dark",

        primary: {
            main: "#7C3AED",        // Rich violet
            light: "#A78BFA",       // Light lavender
            dark: "#5B21B6",        // Deep purple
            contrastText: "#FFFFFF"
        },

        secondary: {
            main: "#EC4899",        // Pink accent
            light: "#F472B6",
            dark: "#DB2777",
            contrastText: "#FFFFFF"
        },

        success: {
            main: "#10B981",        // Green for success/growth
            light: "#34D399",
            dark: "#059669",
            contrastText: "#FFFFFF"
        },

        warning: {
            main: "#F59E0B",        // Amber for warnings
            light: "#FBBF24",
            dark: "#D97706",
            contrastText: "#FFFFFF"
        },

        info: {
            main: "#3B82F6",        // Blue for information
            light: "#60A5FA",
            dark: "#2563EB",
            contrastText: "#FFFFFF"
        },

        background: {
            default: "#0F0F1A",     // Deep dark background
            paper: "#1E1E3F",       // Card surface
            elevated: "#2A2A4A"     // Elevated cards
        },

        text: {
            primary: "#F5F5F5",     // Primary text
            secondary: "#C0C0C0",   // Secondary text
            disabled: "#6B7280",    // Disabled text
            hint: "#9CA3AF"         // Hint text
        },

        divider: "rgba(124, 58, 237, 0.1)" // Purple tinted divider
    },

    typography: {
        fontFamily: [
            'Inter',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif'
        ].join(','),

        h1: {
            fontSize: '2.5rem',
            fontWeight: 700,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            color: '#FFFFFF',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
        },

        h2: {
            fontSize: '2rem',
            fontWeight: 600,
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
            color: '#FFFFFF',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
        },

        h3: {
            fontSize: '1.75rem',
            fontWeight: 600,
            lineHeight: 1.4,
            color: '#FFFFFF',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
        },

        h4: {
            fontSize: '1.5rem',
            fontWeight: 600,
            lineHeight: 1.4,
            color: '#FFFFFF',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
        },

        h5: {
            fontSize: '1.25rem',
            fontWeight: 500,
            lineHeight: 1.5,
            color: '#FFFFFF',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
        },

        h6: {
            fontSize: '1rem',
            fontWeight: 500,
            lineHeight: 1.5,
            color: '#FFFFFF',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
        },

        body1: {
            fontSize: '1rem',
            lineHeight: 1.6,
            fontWeight: 400,
            color: '#E5E7EB'
        },

        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.5,
            fontWeight: 400,
            color: '#E5E7EB'
        },

        caption: {
            fontSize: '0.75rem',
            lineHeight: 1.4,
            fontWeight: 400,
            color: '#9CA3AF'
        },

        button: {
            textTransform: 'none',
            fontWeight: 500,
            borderRadius: 8
        },

        pageTitle: {
            fontSize: '2rem',
            fontWeight: 700,
            lineHeight: 1.2,
            color: '#FFFFFF',
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
            letterSpacing: '-0.02em'
        },

        subtitle: {
            fontSize: '1rem',
            fontWeight: 400,
            lineHeight: 1.5,
            color: '#E5E7EB',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
        }
    },

    spacing: 8,

    shape: {
        borderRadius: 12
    },

    shadows: [
        'none',
        '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '0 25px 50px -12px rgba(124, 58, 237, 0.25)', // Purple glow for elevated elements
        '0 25px 50px -12px rgba(124, 58, 237, 0.35)',
        '0 25px 50px -12px rgba(124, 58, 237, 0.45)',
        '0 25px 50px -12px rgba(124, 58, 237, 0.55)',
        '0 25px 50px -12px rgba(124, 58, 237, 0.65)',
        '0 25px 50px -12px rgba(124, 58, 237, 0.75)',
        '0 25px 50px -12px rgba(124, 58, 237, 0.85)',
        '0 25px 50px -12px rgba(124, 58, 237, 0.95)',
        '0 25px 50px -12px rgba(124, 58, 237, 1)',
        '0 25px 50px -12px rgba(124, 58, 237, 1)',
        '0 25px 50px -12px rgba(124, 58, 237, 1)',
        '0 25px 50px -12px rgba(124, 58, 237, 1)',
        '0 25px 50px -12px rgba(124, 58, 237, 1)',
        '0 25px 50px -12px rgba(124, 58, 237, 1)',
        '0 25px 50px -12px rgba(124, 58, 237, 1)',
        '0 25px 50px -12px rgba(124, 58, 237, 1)',
        '0 25px 50px -12px rgba(124, 58, 237, 1)',
        '0 25px 50px -12px rgba(124, 58, 237, 1)',
        '0 25px 50px -12px rgba(124, 58, 237, 1)',
        '0 25px 50px -12px rgba(124, 58, 237, 1)'
    ],

    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    background: 'linear-gradient(145deg, #1E1E3F 0%, #2A2A4A 100%)',
                    border: '1px solid rgba(124, 58, 237, 0.1)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 20px 25px -5px rgba(124, 58, 237, 0.15), 0 10px 10px -5px rgba(124, 58, 237, 0.1)',
                        borderColor: 'rgba(124, 58, 237, 0.3)'
                    }
                }
            }
        },

        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '10px 20px',
                    fontWeight: 500,
                    textTransform: 'none',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-2px)'
                    }
                },
                contained: {
                    background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
                    boxShadow: '0 4px 14px 0 rgba(124, 58, 237, 0.39)'
                }
            }
        },

        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    fontWeight: 500,
                    fontSize: '0.75rem'
                }
            }
        },

        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none'
                }
            }
        }
    }
});

export default theme;