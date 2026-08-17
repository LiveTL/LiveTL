import { TimeUnit } from "./chat-constants";

export const stringifyRuns = (msg: Ytc.ParsedRun[], ignoreEmoji = false): string => {
  return msg.map(m => {
    if (m.type === 'text') {
      return m.text;
    } else if (m.type === 'emoji') {
      return ignoreEmoji ? '' : `:${m.alt}:`;
    } else {
      return m.text;
    }
  }).join('');
};

export const download = (data: string, filename: string): void => {
  const a = document.createElement('a');
  a.href = `data:text/plain;charset=utf-8,${encodeURIComponent(data)}`;
  a.download = filename.replace(/[/\\?%*:|"<>]/g, '-');
  a.click();
  a.remove();
};

export const convertDurationObjectToMs = (duration: YtcF.AutoClearDurationObject): number => {
  let multiplier = 1;
  if (!duration.enabled) multiplier = 0;
  if (duration.unit === TimeUnit.MONTHS) multiplier = 30 * 24 * 60 * 60 * 1000;
  if (duration.unit === TimeUnit.WEEKS) multiplier = 7 * 24 * 60 * 60 * 1000;
  if (duration.unit === TimeUnit.DAYS) multiplier = 24 * 60 * 60 * 1000;
  if (duration.unit === TimeUnit.HOURS) multiplier = 60 * 60 * 1000;
  return duration.duration * multiplier;
};
