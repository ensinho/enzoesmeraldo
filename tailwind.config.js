/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './script.js'],
    theme: {
        extend: {
            fontFamily: {
                display: ['"Bricolage Grotesque"', 'sans-serif'],
                heading: ['"Bricolage Grotesque"', 'sans-serif'],
                body: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
                mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
                serif: ['"Instrument Serif"', 'Georgia', 'serif'],
            },
            colors: {
                bg: 'rgb(var(--bg-rgb) / <alpha-value>)',
                text: 'rgb(var(--text-rgb) / <alpha-value>)',
                accent: 'rgb(var(--accent-rgb) / <alpha-value>)',
                secondary: 'rgb(var(--secondary-rgb) / <alpha-value>)',
                panel: 'rgb(var(--panel-rgb) / <alpha-value>)',
                gray: 'rgb(var(--gray-rgb) / <alpha-value>)',
            },
            gridTemplateRows: {
                '0fr': '0fr',
                '1fr': '1fr',
            },
        },
    },
    plugins: [],
};
