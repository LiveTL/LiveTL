import type { YTPlayer } from './youtube-player';
import { loadYoutubePlayer } from './youtube-player';

const params = new URLSearchParams(window.location.search);
const videoId = params.get('video');
const UNSTARTED = -1;
const START_RELOAD_OFFSET_MS = 15000;
const START_RELOAD_RETRY_MS = 60000;

const getScheduledStartTime = async (videoId: string): Promise<number | null> => {
  const response = await fetch(`/watch?v=${encodeURIComponent(videoId)}`);
  const scheduledStartTime = /"scheduledStartTime":"(\d+)"/.exec(await response.text())?.[1];
  return scheduledStartTime == null ? null : Number(scheduledStartTime) * 1000;
};

const scheduleStartReload = (player: YTPlayer, videoId: string): void => {
  getScheduledStartTime(videoId)
    .then((startTime) => {
      if (startTime == null || !Number.isFinite(startTime)) return;

      const reloadIfStillWaiting = (): void => {
        if (player.getPlayerState() !== UNSTARTED) return;
        player.loadVideoById(videoId);
        window.setTimeout(reloadIfStillWaiting, START_RELOAD_RETRY_MS);
      };

      window.setTimeout(
        reloadIfStillWaiting,
        Math.max(startTime - Date.now() + START_RELOAD_OFFSET_MS, START_RELOAD_OFFSET_MS),
      );
    })
    .catch(() => {});
};

if (videoId != null) {
  // YouTube's `/error?...` pages now enforce Trusted Types in Chromium.
  // Avoid `innerHTML` so the workaround still boots.
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
  const playerHost = document.createElement('div');
  playerHost.id = 'player';
  document.body.appendChild(playerHost);
  document.body.style.overflow = 'hidden';
  loadYoutubePlayer(
    videoId,
    (player: YTPlayer, runPlayerAction: (action: string) => void) => {
      window.parent.postMessage({ type: 'video-embed-loaded' }, '*');
      scheduleStartReload(player, videoId);

      window.addEventListener('message', (event) => {
        if (event.data.type === 'shortcut-action') {
          runPlayerAction(event.data.action);
        }
      });
    },
    (player: YTPlayer) => {
      if (player.getVideoData().author.includes('Marine Ch.')) {
        window.parent.postMessage({ type: 'marine-easter-egg' }, '*');
      }
    },
  );
  window.addEventListener('message', (event) => {
    window.parent.postMessage(event.data, '*');
  });
}
