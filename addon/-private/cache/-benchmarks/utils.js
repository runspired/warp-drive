export function generateRecords(total) {
  let records = [];

  for (let i = 0; i < total; i++) {
    let id = `${i}-${i * 2}`;

    records.push([ id, { index: i, id }]);
  }

  return shuffle(records);
}

export function shuffle(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


export function testPerf(cb, ...args) {
  let start = performance.now();
  cb(...args);
  let end = performance.now();

  return end - start;
}

export function macroTask() {
  return new Promise(function(resolve) {
    setTimeout(resolve, 10);
  });
}

export function runTest(test, records, runs, label) {
  var chain = Promise.resolve();
  var time = 0;

  for (var i = 0; i < runs; i++) {
    chain = chain.then(function() {
      return macroTask()
        .then(function() {
          time += testPerf(test, records, label);
        });
    });
  }

  return chain.then(function() {
    console.log(label, Math.round((runs * records.length) / time) + '/ms');
  });
}

export function runTests(tests, num = 200, runs = 10) {
  let chain = Promise.resolve();
  let records = generateRecords(num);

  for (let i = 0; i < tests.length; i++) {
    let [testFn, testLabel, testArg] = tests[i];

    chain = chain.then(() => {
      return runTest(testFn, testArg || records, runs, testLabel);
    });
  }

  return chain;
}




