import EmptyObject from '../ember/empty-object';

const INSTRUMENT_TIMES = new EmptyObject();
const MEASUREMENT_TIMES = new EmptyObject();
const MEASUREMENTS = new EmptyObject();

export function measure(label) {
  let time = performance.now();
  let hasStarted = !!MEASUREMENT_TIMES[label];

  if (hasStarted) {
    MEASUREMENTS[label] = MEASUREMENTS[label] || { count: 0, time: 0 };
    MEASUREMENTS[label].time += (time - MEASUREMENT_TIMES[label]);
    MEASUREMENTS[label].count++;
    MEASUREMENT_TIMES[label] = 0;
  } else {
    MEASUREMENT_TIMES[label] = time;
  }
}

export function report(label) {
  let data = MEASUREMENTS[label];
  console.log(`
    Executed ${label} ${data.count} times.
    \t Total Cost:   ${data.time.toFixed(5)}ms
    \t Average Cost: ${(data.time / data.count).toFixed(5)}ms
  `);
}

window.report = report;

export default function instrument(label) {
  let time = performance.now();
  let hasStarted = !!INSTRUMENT_TIMES[label];
  let hasEnded = hasStarted && !!INSTRUMENT_TIMES[label].end;

  if (hasStarted && !hasEnded) {
    INSTRUMENT_TIMES[label].end = time;
    console.log(`\t\t${label}# ${(time - INSTRUMENT_TIMES[label].start).toFixed(3)}ms`);
  } else {
    INSTRUMENT_TIMES[label] = {
      start: time,
      end: undefined
    };
  }
}
