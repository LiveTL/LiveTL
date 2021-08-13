/**
 * @template T
 */
export class Queue {
  constructor() {
    this.clear();
  }

  clear() {
    this.top = null;
    this.last = this.top;
  }

  /**
   * @returns {T}
   */
  pop() {
    const front = this.top;
    this.top = this.top.next;
    if (front === this.last) {
      this.last = null;
    }
    return front;
  }

  /**
   * @param {T} item 
   */
  push(item) {
    const newItem = { data: item };
    if (this.last === null) {
      this.top = newItem;
      this.last = this.top;
    } else {
      this.last.next = newItem;
      this.last = newItem;
    }
  }
}
