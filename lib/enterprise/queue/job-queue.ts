import type { JobType, QueueJob } from "@/types/enterprise";

export type JobHandler<T = unknown, R = unknown> = (job: QueueJob<T>) => Promise<R>;

/**
 * In-process job queue with handler registry.
 * Production: replace with BullMQ or Inngest — same interface.
 */
class JobQueue {
  private handlers = new Map<JobType, JobHandler>();
  private pending: QueueJob[] = [];
  private processing = false;

  register<T, R>(type: JobType, handler: JobHandler<T, R>): void {
    this.handlers.set(type, handler as JobHandler);
  }

  async enqueue<T>(type: JobType, payload: T, maxAttempts = 3): Promise<string> {
    const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const job: QueueJob<T> = {
      id,
      type,
      payload,
      attempts: 0,
      maxAttempts,
      createdAt: new Date(),
    };
    this.pending.push(job as QueueJob);
    void this.processNext();
    return id;
  }

  private async processNext(): Promise<void> {
    if (this.processing || this.pending.length === 0) return;
    this.processing = true;

    while (this.pending.length > 0) {
      const job = this.pending.shift()!;
      const handler = this.handlers.get(job.type);
      if (!handler) {
        console.error(`[queue] No handler for job type: ${job.type}`);
        continue;
      }

      job.attempts += 1;
      try {
        await handler(job);
      } catch (err) {
        console.error(`[queue] Job ${job.id} failed (attempt ${job.attempts}):`, err);
        if (job.attempts < job.maxAttempts) {
          this.pending.push(job);
        }
      }
    }

    this.processing = false;
  }

  getPendingCount(): number {
    return this.pending.length;
  }
}

let queue: JobQueue | null = null;

export function getJobQueue(): JobQueue {
  if (!queue) {
    queue = new JobQueue();
  }
  return queue;
}

export async function enqueueJob<T>(type: JobType, payload: T): Promise<string> {
  return getJobQueue().enqueue(type, payload);
}
