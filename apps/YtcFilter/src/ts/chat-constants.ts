export const enum Theme {
  YOUTUBE = 'YOUTUBE',
  LIGHT = 'LIGHT',
  DARK = 'DARK',
}

export const themeItems = [
  { value: Theme.YOUTUBE, label: 'Use YouTube theme' },
  { value: Theme.LIGHT, label: 'Light theme' },
  { value: Theme.DARK, label: 'Dark theme' },
];

export enum YoutubeEmojiRenderMode {
  SHOW_ALL = 'SHOW_ALL',
  BLOCK_SPAM = 'BLOCK_SPAM',
  HIDE_ALL = 'HIDE_ALL',
}

export const emojiRenderItems = [
  { value: YoutubeEmojiRenderMode.SHOW_ALL, label: 'Show all emojis' },
  { value: YoutubeEmojiRenderMode.BLOCK_SPAM, label: 'Hide emoji-only messages' },
  { value: YoutubeEmojiRenderMode.HIDE_ALL, label: 'Hide all emojis and emoji-only messages' },
];

export enum ChatUserActions {
  BLOCK = 'BLOCK',
  REPORT_USER = 'REPORT_USER',
  DELETE_MESSAGE = 'DELETE_MESSAGE',
  PIN_MESSAGE = 'PIN_MESSAGE',
  TIMEOUT_USER = 'TIMEOUT_USER',
  HIDE_USER = 'HIDE_USER',
  UNHIDE_USER = 'UNHIDE_USER',
  ADD_MODERATOR = 'ADD_MODERATOR',
  REMOVE_MODERATOR = 'REMOVE_MODERATOR',
}

export enum ChatReportUserOptions {
  UNWANTED_SPAM = 'UNWANTED_SPAM',
  PORN_OR_SEX = 'PORN_OR_SEX',
  CHILD_ABUSE = 'CHILD_ABUSE',
  HATE_SPEECH = 'HATE_SPEECH',
  TERRORISM = 'TERRORISM',
  HARASSMENT = 'HARASSMENT',
  SUICIDE = 'SUICIDE',
  MISINFORMATION = 'MISINFORMATION',
}

export enum TimeUnit {
  HOURS = 'HOURS',
  DAYS = 'DAYS',
  WEEKS = 'WEEKS',
  MONTHS = 'MONTHS',
}

export const chatReportUserOptions = [
  { value: ChatReportUserOptions.UNWANTED_SPAM, label: 'Unwanted commercial content or spam' },
  { value: ChatReportUserOptions.PORN_OR_SEX, label: 'Pornography or sexually explicit material' },
  { value: ChatReportUserOptions.CHILD_ABUSE, label: 'Child abuse' },
  { value: ChatReportUserOptions.HATE_SPEECH, label: 'Hate speech or graphic violence' },
  { value: ChatReportUserOptions.TERRORISM, label: 'Promotes terrorism' },
  { value: ChatReportUserOptions.HARASSMENT, label: 'Harassment or bullying' },
  { value: ChatReportUserOptions.SUICIDE, label: 'Suicide or self injury' },
  { value: ChatReportUserOptions.MISINFORMATION, label: 'Misinformation' },
];

export const chatTimeoutOptions = [
  { value: '10 seconds', label: '10 seconds' },
  { value: '1 minute', label: '1 minute' },
  { value: '5 minutes', label: '5 minutes' },
  { value: '10 minutes', label: '10 minutes' },
  { value: '30 minutes', label: '30 minutes' },
  { value: '24 hours', label: '24 hours' },
];

export const chatModeratorRoleOptions = [
  { value: 'Managing moderator', label: 'Managing moderator' },
  { value: 'Standard moderator', label: 'Standard moderator' },
];

export const chatUserActionsItems = [
  {
    value: ChatUserActions.BLOCK,
    text: 'Block user',
    icon: 'block',
    messages: {
      success:
        'The user has been blocked, and you will no longer see their messages. It may take several minutes for the setting to take full effect. You can unblock users in the settings panel at any time.',
      error:
        'There was an error blocking the user. It is possible that this user has already been blocked. If not, please try again later.',
    },
  },
  {
    value: ChatUserActions.REPORT_USER,
    text: 'Report user',
    icon: 'flag',
    messages: {
      success: 'The user has been reported for review by YouTube staff.',
      error: 'There was an error reporting the user. Please try again later.',
    },
  },
  {
    value: ChatUserActions.DELETE_MESSAGE,
    text: 'Delete message',
    icon: 'delete',
    messages: {
      success: 'Your message has been deleted.',
      error: 'There was an error deleting your message. Please try again later.',
    },
  },
  {
    value: ChatUserActions.PIN_MESSAGE,
    text: 'Pin message',
    icon: 'push_pin',
    messages: {
      success: 'The message has been pinned.',
      error: 'There was an error pinning the message. Please try again later.',
    },
  },
  {
    value: ChatUserActions.TIMEOUT_USER,
    text: 'Put user in timeout',
    icon: 'hourglass_empty',
    messages: {
      success: 'The user has been timed out.',
      error: 'There was an error timing out the user. Please try again later.',
    },
  },
  {
    value: ChatUserActions.HIDE_USER,
    text: 'Hide user',
    icon: 'remove_circle',
    messages: {
      success: 'The user has been hidden from this channel.',
      error: 'There was an error hiding the user. Please try again later.',
    },
  },
  {
    value: ChatUserActions.UNHIDE_USER,
    text: 'Unhide user',
    icon: 'add_circle',
    messages: {
      success: 'The user has been unhidden from this channel.',
      error: 'There was an error unhiding the user. Please try again later.',
    },
  },
  {
    value: ChatUserActions.ADD_MODERATOR,
    text: 'Add moderator',
    icon: 'person_add',
    messages: {
      success: 'The user has been added as a moderator.',
      error: 'There was an error adding the moderator. Please try again later.',
    },
  },
  {
    value: ChatUserActions.REMOVE_MODERATOR,
    text: 'Remove moderator',
    icon: 'person_remove',
    messages: {
      success: 'The moderator has been removed.',
      error: 'There was an error removing the moderator. Please try again later.',
    },
  },
];

export const membershipBackground = '0f9d58';
export const milestoneChatBackground = '107516';
export const UNDONE_MSG = 'This action cannot be undone.';
export const UNNAMED_ARCHIVE = 'Unnamed Archive';
export const UNNAMED_FILTER = 'Unnamed Filter';
export const YTCF_MESSAGEDUMPINFOS_KEY = 'ytcf.messageDumpInfos';
export const replyThreadPanelTag = 'PAreply_thread';
export const currentDomain = location.host.includes('youtube')
  ? location.protocol + '//' + location.host
  : 'https://www.youtube.com';
