import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'

export type UITheme = 'light' | 'dark' | 'system'
export type UIResolvedTheme = Exclude<UITheme, 'system'>
export type UIThemeMotion = 'auto' | 'off'
export type UIThemeStyle = CSSProperties & { [key: `--${string}`]: string | number | undefined }

export interface UIThemeProviderProps {
  children: ReactNode
  defaultTheme?: UITheme
  theme?: UITheme
  onThemeChange?: (theme: UITheme) => void
  storageKey?: string | false
  motion?: UIThemeMotion
  className?: string
  style?: UIThemeStyle
}

export interface UIThemeContextValue {
  theme: UITheme
  resolvedTheme: UIResolvedTheme
  setTheme: (theme: UITheme) => void
}

interface ThemeContextValue extends UIThemeContextValue {
  motion: UIThemeMotion
  surfaceStyle: UIThemeStyle
}

export interface UIThemeSurfaceProps {
  'data-x-ui-theme'?: UIResolvedTheme
  'data-x-ui-motion'?: UIThemeMotion
  className?: UIResolvedTheme
  style?: UIThemeStyle
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const palettes: Record<UIResolvedTheme, UIThemeStyle> = {
  light: {
    '--x-ui-background': '#ffffff',
    '--x-ui-surface': '#ffffff',
    '--x-ui-muted': '#f4f4f5',
    '--x-ui-fg': '#18181b',
    '--x-ui-muted-fg': '#71717a',
    '--x-ui-border': '#d4d4d8',
    '--x-ui-primary': '#18181b',
    '--x-ui-primary-fg': '#ffffff',
    '--x-ui-primary-hover': '#333333',
    '--x-ui-focus': '#52525b',
    '--x-ui-danger': '#dc2626',
    '--x-ui-danger-fg': '#dc2626',
    '--x-ui-danger-bg': '#fef2f2',
    '--x-ui-danger-border': '#fecaca',
    '--x-ui-success-bg': '#dcfce7',
    '--x-ui-success-fg': '#166534',
    '--x-ui-success-border': '#86efac',
    '--x-ui-warning-bg': '#fef9c3',
    '--x-ui-warning-fg': '#854d0e',
    '--x-ui-warning-border': '#fde047',
    '--x-ui-info-bg': '#dbeafe',
    '--x-ui-info-fg': '#1e40af',
    '--x-ui-info-border': '#93c5fd',
    '--x-ui-button-radius': '999px',
    '--x-ui-message-bg': '#18181b',
    '--x-ui-message-fg': '#ffffff',
  },
  dark: {
    '--x-ui-background': '#0a0a0a',
    '--x-ui-surface': '#141414',
    '--x-ui-muted': '#202020',
    '--x-ui-fg': '#f5f5f5',
    '--x-ui-muted-fg': '#a1a1aa',
    '--x-ui-border': '#333333',
    '--x-ui-primary': '#f5f5f5',
    '--x-ui-primary-fg': '#111111',
    '--x-ui-primary-hover': '#dddddd',
    '--x-ui-focus': '#a1a1aa',
    '--x-ui-danger': '#f87171',
    '--x-ui-danger-fg': '#f87171',
    '--x-ui-danger-bg': '#331515',
    '--x-ui-danger-border': '#7f1d1d',
    '--x-ui-success-bg': '#102c1c',
    '--x-ui-success-fg': '#86efac',
    '--x-ui-success-border': '#166534',
    '--x-ui-warning-bg': '#33270c',
    '--x-ui-warning-fg': '#fcd34d',
    '--x-ui-warning-border': '#854d0e',
    '--x-ui-info-bg': '#17253d',
    '--x-ui-info-fg': '#93c5fd',
    '--x-ui-info-border': '#1e40af',
    '--x-ui-button-radius': '999px',
    '--x-ui-message-bg': '#f5f5f5',
    '--x-ui-message-fg': '#111111',
  },
}

function isTheme(value: unknown): value is UITheme {
  return value === 'light' || value === 'dark' || value === 'system'
}

function readSavedTheme(storageKey: string | false): UITheme | undefined {
  if (storageKey === false || typeof window === 'undefined') return undefined
  try {
    const value = window.localStorage.getItem(storageKey)
    return isTheme(value) ? value : undefined
  } catch {
    return undefined
  }
}

/**
 * Opt in to a scoped theme. The first client render matches SSR; browser
 * preferences are applied after mounting. No document-level classes are changed.
 */
export function UIThemeProvider({
  children,
  defaultTheme = 'system',
  theme: controlledTheme,
  onThemeChange,
  storageKey = 'x-ui-theme',
  motion = 'auto',
  className,
  style,
}: UIThemeProviderProps) {
  const [uncontrolledTheme, setUncontrolledTheme] = useState<UITheme>(defaultTheme)
  const [systemTheme, setSystemTheme] = useState<UIResolvedTheme>('light')
  const [loadedStorageKey, setLoadedStorageKey] = useState<string | false | null>(null)
  const theme = controlledTheme ?? uncontrolledTheme
  const resolvedTheme = theme === 'system' ? systemTheme : theme

  useEffect(() => {
    const saved = readSavedTheme(storageKey)
    if (controlledTheme === undefined && saved !== undefined) setUncontrolledTheme(saved)
    setLoadedStorageKey(storageKey)
    // A controlled value changing must not reload a stale saved preference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    let media: MediaQueryList
    try {
      media = window.matchMedia('(prefers-color-scheme: dark)')
    } catch {
      return
    }
    const update = () => setSystemTheme(media.matches ? 'dark' : 'light')
    update()
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update)
      return () => media.removeEventListener('change', update)
    }
    if (typeof media.addListener === 'function') {
      media.addListener(update)
      return () => media.removeListener(update)
    }
  }, [])

  useEffect(() => {
    if (storageKey === false || loadedStorageKey !== storageKey || typeof window === 'undefined') return
    try {
      window.localStorage.setItem(storageKey, theme)
    } catch {
      // Storage may be blocked, disabled, or full. Theme changes still work.
    }
  }, [theme, storageKey, loadedStorageKey])

  const setTheme = useCallback((next: UITheme) => {
    if (!isTheme(next)) return
    if (controlledTheme === undefined) setUncontrolledTheme(next)
    onThemeChange?.(next)
  }, [controlledTheme, onThemeChange])

  const surfaceStyle = useMemo(() => {
    const overrides = Object.fromEntries(Object.entries(style ?? {}).filter(([key]) => key.startsWith('--')))
    return { ...palettes[resolvedTheme], ...overrides, colorScheme: resolvedTheme } as UIThemeStyle
  }, [resolvedTheme, style])
  const context = useMemo<ThemeContextValue>(() => ({
    theme, resolvedTheme, setTheme, motion, surfaceStyle,
  }), [theme, resolvedTheme, setTheme, motion, surfaceStyle])

  return (
    <ThemeContext.Provider value={context}>
      <div
        data-x-ui-theme={resolvedTheme}
        data-x-ui-motion={motion}
        className={['x-ui-theme', resolvedTheme, className].filter(Boolean).join(' ')}
        style={{ ...surfaceStyle, ...style }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useUITheme(): UIThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useUITheme must be used within a UIThemeProvider')
  const { theme, resolvedTheme, setTheme } = context
  return { theme, resolvedTheme, setTheme }
}

/** Internal component helper: carry the provider palette into a React portal. */
export function useThemeSurface(): UIThemeSurfaceProps {
  const context = useContext(ThemeContext)
  if (!context) return {}
  return {
    'data-x-ui-theme': context.resolvedTheme,
    'data-x-ui-motion': context.motion,
    className: context.resolvedTheme,
    style: context.surfaceStyle,
  }
}
