export const compose = (...args) =>
  ipt => args.reduceRight((val, func) => func(val), ipt);

export const not = f => (...args) => !f(...args);

export const composeOr = (...args) => ipt => args.some(a => a(ipt));

export const dbg = (...args) => console.log(...args.map(o => `'${o}'`));

export const getWAR = path => window.chrome.runtime.getURL(path);
