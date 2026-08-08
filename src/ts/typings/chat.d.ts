import type { ChatReportUserOptions } from '../chat-constants';
import type { Unsubscriber, YtcQueue } from '../queue';

declare namespace Chat {
  interface MessageDeletedObj {
    replace: Ytc.ParsedRun[];
    viewOriginalText?: Ytc.ParsedRun[];
    pending?: boolean;
  }

  interface MessageAction {
    message: Ytc.ParsedTimedItem;
    deleted?: MessageDeletedObj;
  }

  interface MessagesAction {
    type: 'messages';
    messages: MessageAction[];
  }

  interface BonkAction {
    type: 'bonk';
    bonk: Ytc.ParsedBonk;
  }

  interface DeleteAction {
    type: 'delete';
    deletion: Ytc.ParsedDeleted;
  }

  interface PlayerProgressAction {
    type: 'playerProgress';
    playerProgress: number;
    isFromYt?: boolean;
  }

  interface ForceUpdate {
    type: 'forceUpdate';
    messages: MessageAction[];
    showWelcome?: boolean;
  }

  interface LikeCountsAction {
    type: 'likeCounts';
    counts: Record<string, number>;
  }

  type Actions = MessagesAction | BonkAction | DeleteAction | Ytc.ParsedMisc | PlayerProgressAction | ForceUpdate | LikeCountsAction;

  interface UncheckedFrameInfo {
    tabId: number | undefined;
    frameId: number | undefined;
  }

  interface FrameInfo {
    tabId: number;
    frameId: number;
  }

  interface InitialData {
    type: 'initialData';
    initialData: Actions[];
    selfChannel: SimpleUserInfo | null;
  }

  interface ThemeUpdate {
    type: 'themeUpdate';
    dark: boolean;
  }

  interface LtlMessageResponse {
    type: 'ltlMessage';
    message: LtlMessage;
  }

  interface registerClientResponse {
    type: 'registerClientResponse';
    success: boolean;
    failReason?: string;
  }
  interface Ping {
    type: 'ping';
  }

  interface chatUserActionResponse {
    type: 'chatUserActionResponse';
    action: ChatUserActions;
    message: Ytc.ParsedMessage;
    success: boolean;
  }

  interface fetchReplyThreadMsg {
    type: 'fetchReplyThread';
    requestId: string;
    params: string;
  }

  interface replyThreadResponse {
    type: 'replyThreadResponse';
    requestId: string;
    success: boolean;
    replies: Ytc.ParsedMessage[];
    error?: string;
  }

  type BackgroundResponse =
    Actions | InitialData | ThemeUpdate | LtlMessageResponse |
    registerClientResponse | executeChatActionMsg | chatUserActionResponse | Ping |
    replyThreadResponse;

  type InterceptorSource = 'ytc' | 'ltlMessage';

  interface RegisterInterceptorMsg {
    type: 'registerInterceptor';
    source: InterceptorSource;
    isReplay?: boolean;
  }

  interface RegisterYtcInterceptorMsg extends RegisterInterceptorMsg {
    source: 'ytc';
    isReplay: boolean;
  }

  interface RegisterClientMsg {
    type: 'registerClient';
    // frameInfo: FrameInfo;
    getInitialData?: boolean;
  }

  interface JsonMsg {
    json: string;
  }

  type processJsonMsg = JsonMsg & {
    type: 'processMessageChunk' | 'processSentMessage';
  };

  type setInitialDataMsg = JsonMsg & {
    type: 'setInitialData';
  };

  interface updatePlayerProgressMsg {
    type: 'updatePlayerProgress';
    playerProgress: number;
    isFromYt?: boolean;
  }

  interface setThemeMsg {
    type: 'setTheme';
    dark: boolean;
  }

  interface getThemeMsg {
    type: 'getTheme';
    // frameInfo: FrameInfo;
  }

  interface sendLtlMessageMsg {
    type: 'sendLtlMessage';
    message: LtlMessage;
  }

  interface executeChatActionMsg {
    type: 'executeChatAction';
    message: Ytc.ParsedMessage;
    action: ChatUserActions;
    reportOption?: ChatReportUserOptions;
  }

  type BackgroundMessage =
    RegisterInterceptorMsg | RegisterClientMsg | processJsonMsg |
    setInitialDataMsg | updatePlayerProgressMsg | setThemeMsg | getThemeMsg |
    RegisterYtcInterceptorMsg | sendLtlMessageMsg | executeChatActionMsg | chatUserActionResponse | Ping |
    fetchReplyThreadMsg | replyThreadResponse;

  type Port = Omit<chrome.runtime.Port, 'postMessage' | 'onMessage'> & {
    postMessage: (message: BackgroundMessage | BackgroundResponse) => void;
    onMessage: {
      addListener: (
        callback: (message: BackgroundResponse, port: Port) => void
      ) => void;
    };
    destroy?: () => void;
  };

  interface Interceptor {
    // frameInfo: FrameInfo;
    // port?: Port;
    clients: Port[];
    source?: InterceptorSource;
  }

  interface YtcInterceptor extends Interceptor {
    source: 'ytc';
    dark: boolean;
    queue: YtcQueue;
    queueUnsub?: Unsubscriber;
  }

  type Interceptors = Interceptor | YtcInterceptor;

  interface LtlMessage {
    text: string;
    messageArray: Ytc.ParsedRun[];
    author: string;
    timestamp: string;
    types: number;
    authorId: string;
    messageId: string;
  }
}
