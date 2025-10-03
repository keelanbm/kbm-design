import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        accent: {
          work: 'hsl(var(--accent-work))',
          motion: 'hsl(var(--accent-motion))',
          code: 'hsl(var(--accent-code))',
        },
      },
    },
  },
  plugins: [],
}

export default config
