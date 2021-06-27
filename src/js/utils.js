export const compose = (...args) =>
  ipt => args.reduceRight((val, func) => func(val), ipt);

export const not = f => (...args) => !f(...args);

export const composeOr = (...args) => ipt => args.some(a => a(ipt));

export const dbg = (...args) => console.log(...args.map(o => `'${o}'`));

export const getWAR = path => window.chrome.runtime.getURL(path);

export const delayed = (fn, start) => {
  let val = start;
  return (...args) => {
    const prev = val;
    val = fn(...args);
    return prev;
  };
};

export const combineArr = arrs => arrs.reduce((l, r) => [...l, ...r], []);
