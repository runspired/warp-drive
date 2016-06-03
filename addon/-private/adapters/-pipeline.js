import RSVP from 'rsvp';


export default class Pipeline {

  constructor(pipe, methods) {
    let deferred = RSVP.defer();
    let chain = deferred.promise;
    let firstStep = methods.shift();
    let request;
    let response = {};

    chain = chain
              .then((args) => { return pipe[firstStep](...args); })
              .then((req) => { request = req; });

    for (let method of methods) {
      if (method instanceof Array) {
        let [success, fail] = method;

        if (pipe[success] && pipe[fail]) {
          chain = chain.then(
            () => {
              return pipe[success](request, response);
            },
            (error) => {
              return pipe[fail](request, response, error);
            });

        } else if (pipe[success]) {
          chain = chain.then(() => {
            return pipe[success](request, response);
          });

        } else if (pipe[fail]) {
          chain = chain.then(null, (error) => {
            return pipe[fail](request, response, error);
          });
        }

      } else if (pipe[method]) {
        chain = chain.then(() => {
          return pipe[method](request, response);
        });
      }
    }

    chain.finally(() => {
      chain = null;
      deferred = null;
      this.chain = null;
      this.deferred = null;
    });

    this.deferred = deferred;
    this.chain = chain;
  }

  pipe(...args) {
    this.deferred.resolve(args);

    return this.chain;
  }

}
