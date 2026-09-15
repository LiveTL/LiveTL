declare module 'is-dark-color' {
  export default function isDarkColor(color: `#${string}`): boolean;
}

declare module 'sha-1' {
  export default function sha1(str: string): string;
}

declare module 'vite-plugin-zip-pack' {
  // TS 4.3 doesn't reliably resolve this package's export map.
  const zipPack: any;
  export default zipPack;
}
