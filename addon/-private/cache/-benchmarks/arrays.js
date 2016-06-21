import FastArray from '../fast-array';
import { runTests, generateRecords, shuffle } from './utils';

export function arrayWrite(records) {
  let arr = [];

  for (let i = 0; i < records.length; i++) {
    arr.push('hello-' + i);
  }

  return arr;
}

export function smartArrayWrite(records) {
  let arr = new FastArray();

  for (let i = 0; i < records.length; i++) {
    arr.push('hello-' + i);
  }

  return arr;
}

export function arrayRead([arr, indeces]) {
  let vals = [];

  for (let i = 0; i < indeces.length; i++) {
    vals.push(arr[indeces[i]]);
  }

  return vals;
}

export function smartArrayRead([smartArr, indeces]) {
  let vals = [];

  for (let i = 0; i < indeces.length; i++) {
    vals.push(smartArr.get(indeces[i]));
  }

  return vals;
}

export default function testArrays(num, runs) {
  var records = generateRecords(num);
  var arr = arrayWrite(records);
  var smartArr = smartArrayWrite(records);
  var indeces = records.map(function(i, index) { return index; });
  indeces = shuffle(indeces);

  var tests = [
    [arrayWrite, 'array#write'],
    [smartArrayWrite, 'smartArray#write'],
    [arrayRead, 'array#read', [arr, indeces]],
    [smartArrayRead, 'smartArray#read', [smartArr, indeces]]
  ];

  return runTests(tests, num, runs);
}
