/* eslint-disable @typescript-eslint/naming-convention */
declare const __BROWSER__: 'chrome' | 'firefox';
declare const __VERSION__: string;

// Vite CSS imports with ?inline suffix
declare module '*?inline' {
  const content: string;
  export default content;
}
