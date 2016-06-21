import CacheList from '../cache-list';
import CachePairs from '../cache-pairs';
import SortedMap from '../sorted-map';
import EmptyObject from '../../ember/empty-object';

import { runTests, generateRecords, shuffle } from './utils';

function populateMap(amount) {
  var map = new Map();
  for (var i = 0; i < amount; i++) {
    map.set(i, 'hello-' + i);
  }
  return map;
}


function populateNullObject(amount) {
  var obj = Object.create(null);
  for (var i = 0; i < amount; i++) {
    obj[i] = 'hello-' + i;
  }
  return obj;
}

function populateEmptyObject(amount) {
  var obj = new EmptyObject();
  for (var i = 0; i < amount; i++) {
    obj[i] = 'hello-' + i;
  }
  return obj;
}

function populateSortedMap(amount) {
  var arr = new SortedMap();
  for (var i = 0; i < amount; i++) {
    arr.set(i, 'hello-' + i);
  }
  return arr;
}
