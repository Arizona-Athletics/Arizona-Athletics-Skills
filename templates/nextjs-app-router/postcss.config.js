// Tailwind 4 uses the dedicated `@tailwindcss/postcss` PostCSS plugin instead
// of the v3-era `tailwindcss` plugin. Autoprefixer is still useful for the
// handful of properties Tailwind does not auto-prefix.
export default {
  plugins: {
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};
