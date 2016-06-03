import { Promise } from 'rsvp';



export default class Pipeline {

  constructor(pipe, methods) {
    let deferred = Promise.defer();
    let chain = deferred.promise;
    let firstStep = methods.shift();
    let request;
    let response = {};

    chain = chain
              .then(pipe[firstStep].bind(pipe))
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
      this.deferred = null;
    });

    this.deferred = deferred;
  }

  pipe(...args) {
    return this.deferred.resolve(...args);
  }

}
