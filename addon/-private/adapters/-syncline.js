import RSVP from 'rsvp';

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
  let exe;

  while (methods.length) {
    let method = methods.shift();

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
  }

  return exe;
}

function syncline(pipe, methods, initialArgs) {
  return RSVP.Promise.resolve()
    .then(() => {
      let firstStep = methods.shift();
      let request = pipe[firstStep](...initialArgs);
      let response = {};

      return walkChain(pipe, request, response, methods);
    });
}
