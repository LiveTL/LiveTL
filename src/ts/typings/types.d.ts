import { Writable } from 'svelte/store';

declare namespace Ltl {
  enum AuthorType {
    moderator = 1 << 0,
    verified = 1 << 1,
    owner = 1 << 2,
    member = 1 << 3,
    mchad = 1 << 4,
    api = 1 << 5
  }

  interface Message {
    text: string;
    messageArray: Ytc.ParsedRun[];
    author: string;
    timestamp: string;
    types: AuthorType;
    authorId: string;
    messageId: string;
    hidden?: boolean;
    deleted?: boolean;
  }

  interface FeaturePromptContent {
    prompt: string; // the prompt message for help
    icon: string;
    hasDismissed: Writable<boolean>;
    demoLink: string; // string path (not actual WAR path) to feature demo
  }
}
