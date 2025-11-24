class WQ {
  private tasks = [];
  private busyWorkers = 0;
  private MAX_WORKERS = 8; // can autoscale later

  add(task) {
    this.tasks.push(task);
  }

  async run() {
    if (this.busyWorkers >= this.MAX_WORKERS) return;
    const nextTask = this.tasks.shift();
    if (!nextTask) return;

    this.busyWorkers++;

    try {
      // executes external worker
      const workerResponse = await globalThis.workerBridge.execute(nextTask);
      nextTask.resolve?.(workerResponse);
    } catch (err) {
      nextTask.reject?.(err);
    } finally {
      this.busyWorkers--;
    }
  }
}

export const WorkerQueue = new WQ();

setInterval(() => WorkerQueue.run(), 25);
