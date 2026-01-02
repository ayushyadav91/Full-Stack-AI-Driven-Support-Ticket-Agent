import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                'DEFAULT': '0.75rem',
                'sm': '0.5rem',
                'md': '0.75rem',
                'lg': '1rem',
                'xl': '1.25rem',
                '2xl': '1.5rem',
            },
        },
    },
    darkMode: "class",
    plugins: [heroui({
        themes: {
            light: {
                layout: {
                    radius: {
                        small: "8px",
                        medium: "12px",
                        large: "16px",
                    },
                },
            },
        },
    })],
};
