interface CustomEvent extends Event {
  detail?: any;
}

interface SimpleUserInfo {
  name: string;
  channelId: string;
  handle?: string;
}

interface SimpleVideoInfo {
  channel: SimpleUserInfo;
  video: {
    videoId: string;
    title: string;
  };
}
