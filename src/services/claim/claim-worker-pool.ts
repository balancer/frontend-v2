import { times } from 'lodash';
import PromiseWorker from 'promise-worker';
// @ts-ignore
import ClaimWorker from 'worker-loader!./claim.worker';

class ClaimWorkerPool {
  workers: PromiseWorker[];
  workerIndex: number;

  constructor(numberOfWorkers = 4) {
    this.workers = times(
      numberOfWorkers,
      () => new PromiseWorker(new ClaimWorker())
    );

    this.workerIndex = 0;
  }

  public get worker() {
    return this.workers[this.workerIndex++ % this.workers.length];
  }
}

export const claimWorkerPool = new ClaimWorkerPool(8);
