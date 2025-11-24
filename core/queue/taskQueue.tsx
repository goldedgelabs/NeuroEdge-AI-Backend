export interface Task {
  id: string;
  type: string;
  engineId?: string;
  agentId?: string;
  payload: any;
  priority: number;
  timestamp: number;
}

export class TaskQueue {
  private queue: Task[] = [];

  add(task: Task) {
    this.queue.push(task);
    this.queue.sort((a, b) => b.priority - a.priority);
  }

  next(): Task | null {
    return this.queue.shift() || null;
  }

  size() {
    return this.queue.length;
  }
}

export const GlobalTaskQueue = new TaskQueue();
