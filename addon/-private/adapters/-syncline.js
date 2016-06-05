import RSVP from 'rsvp';
import asap from './asap';

RSVP.configure('async', function(callback, promise) {
  asap(function() { callback(promise); });
});

function insertCatchLink(pipe, request, response, hooks, chain) {
  let [success, fail] = hooks;

  if (pipe[success] && pipe[fail]) {
    return chain.then(
      () => {
        return pipe[success](request, response);
      },
      (error) => {
        return pipe[fail](request, response, error);
      });

  }

  if (pipe[success]) {
    return chain.then(() => {
      return pipe[success](request, response);
    });

  }

  if (pipe[fail]) {
    return chain.then(null, (error) => {
      return pipe[fail](request, response, error);
    });
  }

  return chain;
}


function walkChain(context, request, response, methods) {
  let method = methods.shift();
  let exe;

  if (context[method]) {
    exe = context[method](request, response);

    if (exe && exe.then) {
      if (methods[0] instanceof Array) {
        exe = insertCatchLink(context, request, response, methods.shift(), exe);
      }
      return exe.then(function() {
        return walkChain(context, request, response, methods);
      });
    }
  }

  if (methods.length) {
    return walkChain(context, request, response, methods);
  }

  return exe;
}

export default class Syncline {

  constructor(pipe, methods, initialArgs) {
    let firstStep = methods.shift();
    let request;
    let response = {};

    let chain = RSVP.Promise.resolve()
      .then(() => {
        request = pipe[firstStep](...initialArgs);

        return walkChain(pipe, request, response, methods);
        })
      .finally(() => {
        chain = null;
        this.chain = null;
      });

    this.chain = chain;
  }

}
