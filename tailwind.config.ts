import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.{md,mdx}',
    './lib/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      /**
       * Brand colors map to CSS design tokens defined in globals.css.
       * Use these as Tailwind classes: text-brand-gold, bg-brand-navy, etc.
       * Note: opacity modifiers (text-brand-gold/50) are not supported for
       * CSS-var-backed colors — use rgba() in inline styles for opacity variants.
       */
      colors: {
        brand: {
          // Dark surfaces
          'navy-deep': 'var(--color-navy-900)',
          navy:        'var(--color-navy-800)',
          surface:     'var(--color-navy-500)',
          // Gold accent
          gold:        'var(--color-gold-500)',
          'gold-light': 'var(--color-gold-300)',
          'gold-pale':  'var(--color-gold-100)',
          // Text on dark
          ink:    'var(--color-ink)',
          muted:  'var(--color-ink-muted)',
          cream:  'var(--color-cream)',
          // Semantic aliases
          primary: 'var(--color-primary)',
          text:    'var(--color-text)',
          heading: 'var(--color-heading)',
          border:  'var(--color-border)',
          // Track accents
          'track-a': 'var(--color-track-a)',
          'track-b': 'var(--color-track-b)',
          'track-c': 'var(--color-track-c)',
        },
      },
      fontFamily: {
        sans:    ['var(--font-body)'],
        heading: ['var(--font-heading)'],
        ui:      ['var(--font-ui)'],
        mono:    ['var(--font-mono)'],
      },
      borderRadius: {
        sm:   'var(--radius-sm)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        xl:   'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        xs:   'var(--shadow-xs)',
        sm:   'var(--shadow-sm)',
        md:   'var(--shadow-md)',
        lg:   'var(--shadow-lg)',
        xl:   'var(--shadow-xl)',
        hero: 'var(--shadow-hero)',
        card: 'var(--shadow-card)',
      },
      spacing: {
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '10': 'var(--space-10)',
        '12': 'var(--space-12)',
        '16': 'var(--space-16)',
        '20': 'var(--space-20)',
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body':     'var(--color-article-body)',
            '--tw-prose-headings': 'var(--color-article-heading)',
            '--tw-prose-links':    'var(--color-track-a)',
            '--tw-prose-bold':     'var(--color-article-heading)',
            '--tw-prose-quotes':   'var(--color-article-muted)',
            maxWidth: '65ch',
          },
        },
      },
      maxWidth: {
        container: 'var(--container-max)',
        wide:      'var(--container-wide)',
      },
    },
  },
  plugins: [typography],
}
export default config
