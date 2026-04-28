/// <reference types="vite/client" />

// Declarações para imports de CSS
declare module '*.css' {
  const content: Record<string, string>
  export default content
}

// Declarações para @fontsource
declare module '@fontsource/*' {
  const content: Record<string, string>
  export default content
}
