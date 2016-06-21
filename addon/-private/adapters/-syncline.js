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


function walkChain(context, request, response, methods, iter = 1) {
  let exe;

  while (iter < methods.length) {
    let method = methods[iter++];

    if (context[method]) {
      exe = context[method](request, response);

      if (exe && exe.then) {
        if (methods[iter] instanceof Array) {
          exe = insertCatchLink(context, request, response, methods[iter++], exe);
        }
        return exe.then(function () {
          return walkChain(context, request, response, methods, iter);
        });
      }
    }
  }

  return exe;
}

export default function syncline(pipe, methods, initialArgs) {
  console.log('\n\n-----------------------------\n\n');
  return RSVP.Promise.resolve()
    .then(() => {
      let firstStep = methods[0];
      let request = pipe[firstStep](...initialArgs);
      let response = {};

      return walkChain(pipe, request, response, methods);
    });
}
