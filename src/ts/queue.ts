export interface Queue<T> {
  clear: () => void
  pop: () => T | undefined
  push: (item: T) => void
}

export function queue<T>(): Queue<T> {
  interface Data {
    data: T
    next_?: Data
  }
  let top_: Data | null = null;
  let last: Data | null = top_;

  function clear() {
    top_ = null;
    last = top_;
  }

  function pop(): T | undefined {
    const front = top_;
    if (front) {
      top_ = top_?.next_ || null;
      if (front === last) {
        last = null;
      }
      return front.data;
    }
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
}
