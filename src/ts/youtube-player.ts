import YouTubeIframeLoader from 'youtube-iframe';

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
  onReady: (player: YTPlayer) => void = noop,
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
        onReady: (event: YT.PlayerEvent) => onReady(event.target as YTPlayer),
        onStateChange: (event: YT.OnStateChangeEvent) => onStateChange(player, event.data)
      }
    });
  });
};
