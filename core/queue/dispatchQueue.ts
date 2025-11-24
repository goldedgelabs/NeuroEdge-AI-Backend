import { GlobalTaskQueue } from "./taskQueue";
import { EngineQueue } from "./engineQueue";
import { WorkerQueue } from "./workerQueue";

export class DispatchQueue {
  run() {
    setInterval(() => {
      const task = GlobalTaskQueue.next();
      if (!task) return;

      if (task.engineId) {
        EngineQueue.add(task);
      } else {
        WorkerQueue.add(task);
      }
    }, 20);
  }
}

export const Dispatcher = new DispatchQueue();
