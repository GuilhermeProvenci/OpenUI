export type SandboxMode = 'jsx' | 'html'

interface SandboxOptions {
  mode: SandboxMode
  codeJsx?: string | null
  codeHtml?: string | null
  codeCss?: string | null
  codeJs?: string | null
  theme?: 'light' | 'dark'
}

/**
 * Build an HTML document string for rendering inside a sandboxed iframe.
 * In JSX mode, loads React 18 + Babel standalone from CDN.
 * In HTML mode, renders raw HTML + CSS + JS.
 */
export function buildSandboxHtml(opts: SandboxOptions): string {
  const bg = opts.theme === 'dark' ? '#0f172a' : '#ffffff'
  const textColor = opts.theme === 'dark' ? '#e2e8f0' : '#1e293b'

  const baseStyles = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: ${bg};
      color: ${textColor};
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 16px;
      font-family: system-ui, -apple-system, sans-serif;
    }
  `

  const navigationPreventionScript = `
    <script>
      // Prevent all links from navigating the iframe to the root or relative paths
      document.addEventListener('click', (e) => {
        const target = e.target.closest('a');
        if (target) {
          const href = target.getAttribute('href');
          if (!href || href === '#' || href.startsWith('/') || href.includes(window.location.host)) {
            e.preventDefault();
            console.log('Navigation prevented in sandbox:', href);
          }
        }
      }, true);

      // Prevent form submissions
      document.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Form submission prevented in sandbox');
      }, true);
    </script>
  `

  if (opts.mode === 'jsx') {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>${baseStyles}${opts.codeCss ?? ''}</style>
  ${navigationPreventionScript}
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${opts.codeJsx ?? ''}
    const rootElement = document.getElementById('root')
    if (typeof App !== 'undefined') {
      ReactDOM.createRoot(rootElement).render(React.createElement(App))
    }
  </script>
</body>
</html>`
  }

  // HTML mode
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>${baseStyles}${opts.codeCss ?? ''}</style>
  ${navigationPreventionScript}
</head>
<body>
  ${opts.codeHtml ?? ''}
  <script>${opts.codeJs ?? ''}</script>
</body>
</html>`
}
