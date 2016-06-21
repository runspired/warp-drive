import instrument from './instrument';

export class FlushTask {

  constructor(size) {
    this.work = new Array(size);
    this._flush = undefined;
    this.length = 0;
    this.maxLength = size;
  }

  schedule(...job) {
    let length = this.length++;

    if (length > this.maxLength) {
      this.maxLength *= 2;
      this.work.length = this.maxLength;
    }

    this.work[length] = job;
  }

  flush() {
    if (!this._flush) {
      this._flush = Promise.resolve()
        .then(() => {
          // instrument('flushJobs');

          for (let i = 0; i < this.length; i++) {
            let [context, job, ...args] = this.work[i];

            job.apply(context, args);

            this.work[i] = undefined;
          }

          // instrument('flushJobs');
          this.length = 0;
          this._flush = false;
        });
    }

    return this._flush;
  }

}

const updater = new FlushTask(2000);

export default updater;
