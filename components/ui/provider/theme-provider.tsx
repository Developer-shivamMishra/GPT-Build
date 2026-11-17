"use client"

import * as React from "react"

type Theme = "light" | "dark" | "system"

const MEDIA = "(prefers-color-scheme: dark)"

function systemTheme(): "light" | "dark" {
  return window.matchMedia(MEDIA).matches ? "dark" : "light"
}

function applyTheme(theme: Theme, disableTransition: boolean) {
  const resolved = theme === "system" ? systemTheme() : theme
  const root = document.documentElement
  let restore: (() => void) | undefined

  if (disableTransition) {
    const style = document.createElement("style")
    style.appendChild(
      document.createTextNode(
        "*,*::before,*::after{transition:none!important}"
      )
    )
    document.head.appendChild(style)
    restore = () => {
      window.getComputedStyle(document.body)
      setTimeout(() => {
        document.head.removeChild(style)
      }, 1)
    }
  }

  root.classList.remove("light", "dark")
  root.classList.add(resolved)
  root.style.colorScheme = resolved
  restore?.()
}

const ThemeContext = React.createContext<{
  theme: Theme
  setTheme: (theme: Theme) => void
}>({
  theme: "system",
  setTheme: () => {},
})

export function useTheme() {
  return React.useContext(ThemeContext)
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = false,
  storageKey = "theme",
}: {
  children: React.ReactNode
  attribute?: "class"
  defaultTheme?: Theme
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
  storageKey?: string
}) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)

  React.useEffect(() => {
    const stored = localStorage.getItem(storageKey) as Theme | null
    const next = stored ?? defaultTheme
    const resolved = !enableSystem && next === "system" ? "light" : next
    setThemeState(resolved)
    applyTheme(resolved, false)
  }, [defaultTheme, enableSystem, storageKey])

  React.useEffect(() => {
    if (!enableSystem) return

    const media = window.matchMedia(MEDIA)
    const onChange = () => {
      const stored = (localStorage.getItem(storageKey) as Theme | null) ?? defaultTheme
      if (stored === "system") applyTheme("system", false)
    }

    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [defaultTheme, enableSystem, storageKey])

  const setTheme = React.useCallback(
    (next: Theme) => {
      const resolved = !enableSystem && next === "system" ? "light" : next
      localStorage.setItem(storageKey, resolved)
      setThemeState(resolved)
      applyTheme(resolved, disableTransitionOnChange)
    },
    [disableTransitionOnChange, enableSystem, storageKey]
  )

  const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
