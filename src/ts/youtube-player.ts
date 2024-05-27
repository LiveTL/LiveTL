// import YouTubeIframeLoader from 'youtube-iframe';
// @ts-expect-error
import { YouTubeIframeLoader } from 'yt-iframe-noremote';
import { clamp } from '../js/utils.js';

const noop = (): any => {};

export interface YTPlayer extends YT.Player {
  /**
   * Not officially documented but exists.
   * (Hopefully YT won't just remove it one day lol)
   */
  getVideoData: () => {
    video_id: string;
    author: string;
    title: string;
    video_quality?: string;
    isLive?: boolean;
    isWindowedLive?: boolean;
    isManifestless?: boolean;
    allowLiveDvr?: boolean;
    isListed?: boolean;
  };
}

export const loadYoutubePlayer = (
  videoId: string,
  onReady: (player: YTPlayer, runPlayerAction: (action: string) => void) => void = noop,
  onStateChange: (player: YTPlayer, state: YT.PlayerState) => void = noop
): void => {
  YouTubeIframeLoader.load(YT => {
    const player: YTPlayer = new YT.Player('player', {
      height: '100%',
      width: '100%',
      videoId,
      autoplay: 1,
      playerVars: {
        autoplay: 1,
        fs: 0
      },
      events: {
        onReady: (event: YT.PlayerEvent) => {
          const player = event.target;
          const runPlayerAction = (action: string): void => {
            switch (action) {
              case 'volumeUp':
                player.setVolume(clamp(player.getVolume() + 10, 0, 100));
                break;
              case 'volumeDown':
                player.setVolume(clamp(player.getVolume() - 10, 0, 100));
                break;
              case 'fullScreen':
                console.debug('Got request for fullscreen, fullscreen must be done in main frame');
                break;
              case 'toggleMute':
                player.isMuted() ? player.unMute() : player.mute();
                break;
              case 'togglePlayPause':
                {
                  const paused = player.getPlayerState() === 2;
                  paused ? player.playVideo() : player.pauseVideo();
                }
                break;
              default:
                console.debug('Got unknown shortcut action', action);
                break;
            }
          };

          onReady(player as YTPlayer, runPlayerAction);
        },
        onStateChange: (event: YT.OnStateChangeEvent) => onStateChange(player, event.data)
      }
    });
  });
};
