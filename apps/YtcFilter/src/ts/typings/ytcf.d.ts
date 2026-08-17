declare namespace YtcF {
  interface BaseCondition {
    type: string;
    property: string;
    needsClear?: boolean;
  }
  interface StringCondition extends BaseCondition {
    type: 'includes' | 'startsWith' | 'endsWith' | 'regex' | 'tltag' | 'equals';
    property: 'message' | 'authorName' | 'authorChannelId';
    value: string;
    invert: boolean;
    caseSensitive: boolean;
  }
  interface BooleanCondition extends BaseCondition {
    type: 'boolean';
    property: 'superchat' | 'verified' | 'moderator' | 'owner' | 'member' | 'membershipItem';
    invert: boolean;
  }
  type FilterCondition = StringCondition | BooleanCondition;
  interface ChatFilter {
    nickname?: string;
    type: 'basic' | 'advanced';
    conditions: FilterCondition[];
    id: string;
    enabled: boolean;
  }
  interface PresetTrigger {
    property: 'channelName' | 'channelHandle' | 'channelId' | 'videoTitle' | 'videoId';
    type: 'includes' | 'startsWith' | 'endsWith' | 'regex';
    value: string;
    caseSensitive: boolean;
  }
  interface FilterPreset {
    nickname: string;
    filters: ChatFilter[];
    id: string;
    triggers: PresetTrigger[];
    activation: 'manual' | 'auto';
  }
  interface AutoClearDurationObject {
    enabled: boolean;
    duration: number;
    unit: TimeUnit.WEEKS;
  };
  interface MessageDumpInfoItem {
    nickname: string;
    continuation: string[];
    info: SimpleVideoInfo | null;
    key: string;
    presetId: string | null;
    lastEdited: number;
    size?: number;
  }
  export type MessageDumpActionsItem = Chat.MessageAction[];
  export interface MessageDumpExportItem extends MessageDumpInfoItem {
    actions: MessageDumpActionsItem;
  }
  export interface MessageDump {
    version: string;
    dumps: MessageDumpExportItem[];
  }
}
