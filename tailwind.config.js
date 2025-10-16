import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            
        },
    },

    plugins: [forms, require('@tailwindcss/forms'), require('daisyui')],


  safelist: [
    'online', 
    'offline',
    'avatar', 
    'chat-image' // optional if you use it
  ],
    daisyui :{
        themes: true,
        darkTheme : "dark",
        base: true,
        styled:true,
        utils:true,
        prefix:"",
        logs: true,
        themeRoot: ":root",
    },
};
