export interface Queue<T> {
  clear(): void;
  pop(): T;
  push(item: T): void;
}

export function queue<T>(): Queue<T> {
  type Data = {
    data: T;
    next_?: Data;
  }
  let top_: Data | null = null;
  let last: Data | null = top_;

  function clear() {
    top_ = null;
    last = top_;
  }

  function pop(): T {
    const front = top_;
    top_ = top_.next_;
    if (front === last) {
      last = null;
    }
    return front.data;
  }

  function push(item: T) {
    const newItem = { data: item };
    if (last === null) {
      top_ = newItem;
      last = top_;
    } else {
      last.next_ = newItem;
      last = newItem;
    }
  }

  return { clear, pop, push };
};
