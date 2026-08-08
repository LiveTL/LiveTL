declare global {
  interface Window {
    ytglobal: any;
    ytcfg: any;
  }
}

/**
 * Modified TypeScript version of "Workaround For Youtube Chat Memory Leaks" by
 * laversheet (https://twitter.com/laversheet).
 *
 * Original userscript: https://greasyfork.org/en/scripts/422206-workaround-for-youtube-chat-memory-leaks/code
 * @license BSD-3-Clause https://opensource.org/licenses/BSD-3-Clause
 */
export function fixLeaks(): boolean {
  'use strict';

  /*
   * Currently (2021-02-23), youtube live chat has a bug that never execute some scheduled tasks.
   * Those tasks are scheduled for each time a new message is added to the chat and hold the memory until being executed.
   * This script will let the scheduler to execute those tasks so the memory held by those tasks could be freed.
   */
  function fixSchedulerLeak(): boolean {
    // if (!window.requestAnimationFrame) {
    //   console.warn('fixSchedulerLeak: window.requestAnimationFrame() is required, but missing');
    //   return false;
    // }
    const scheduler = window.ytglobal?.schedulerInstanceInstance_;
    if (!scheduler) {
      console.warn('fixSchedulerLeak: schedulerInstanceInstance_ is missing');
      return false;
    }
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    const code = '' + scheduler.constructor;
    const p1 = code.match(/this\.(\w+)\s*=\s*!!\w+\.useRaf/) ??
               code.match(/this\.(\w+)\s*=\s*\(\w+\("scheduler_use_raf_by_default"\)/);
    const p2 = code.match(/\("visibilitychange",\s*this\.(\w+)\)/);
    if (!p1 || !p2) {
      console.warn('fixSchedulerLeak: unknown code');
      return false;
    }
    const useRafProp = p1[1];
    const visChgProp = p2[1];
    if (scheduler[useRafProp]) {
      console.info('fixSchedulerLeak: no work needed');
      return false;
    }
    scheduler[useRafProp] = true;
    document.addEventListener('visibilitychange', scheduler[visChgProp]);
    console.info('fixSchedulerLeak: leak fixed');
    return true;
  }

  /* Enable the element pool to save memory consumption. */
  function enableElementPool(): boolean {
    const ytcfg = window.ytcfg;
    if (!ytcfg) {
      console.warn('enableElementPool: ytcfg is missing');
      return false;
    }
    if (ytcfg.get('ELEMENT_POOL_DEFAULT_CAP')) {
      console.info('enableElementPool: no work needed');
      return false;
    }
    ytcfg.set('ELEMENT_POOL_DEFAULT_CAP', 75);
    console.info('enableElementPool: element pool enabled');
    return true;
  }

  const fixedScheduler = fixSchedulerLeak();
  const enabledPool = enableElementPool();
  return fixedScheduler && enabledPool;
}
