import { popoutDims } from './storage';

let setterTimeout: number | undefined;

window.addEventListener('resize', () => {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  setterTimeout = setterTimeout ?? setTimeout(async () => {
    await popoutDims.set({ width: window.outerWidth, height: window.outerHeight });
    clearTimeout(setterTimeout);
    setterTimeout = undefined;
  }, 100) as any as number;
});

// eslint-disable-next-line @typescript-eslint/no-floating-promises
popoutDims.ready().then(() => {
  const { width, height } = popoutDims.getCurrent();
  window.resizeTo(width, height);
});
