const themeInitScript = `(function(){try{var el=document.documentElement;var theme=localStorage.getItem("theme")||"system";if(theme==="system"){theme=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}el.classList.remove("light","dark");el.classList.add(theme);el.style.colorScheme=theme}catch(e){}})();`

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
}
