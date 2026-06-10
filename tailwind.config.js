/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './script.js'],
    theme: {
        extend: {
            fontFamily: {
                display: ['"Syne"', 'sans-serif'],
                heading: ['"Syne"', 'sans-serif'],
                body: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Helvetica', 'Arial', 'sans-serif'],
                mono: ['"Space Mono"', 'monospace'],
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
