/* eslint-disable @typescript-eslint/naming-convention */
declare const __BROWSER__: 'chrome' | 'firefox';
declare const __VERSION__: string;
/** Target manifest version. Build-time constant, so `__MV__` branches are
 *  dead-code-eliminated and each bundle only carries its own MV's code. */
declare const __MV__: 2 | 3;
/** Whether HyperChat is being bundled as part of LiveTL. */
declare const __LIVETL__: boolean;

// Vite CSS imports with ?inline suffix
declare module '*?inline' {
  const content: string;
  export default content;
}
