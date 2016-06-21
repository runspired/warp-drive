import emberRequire from './ext-require';
import SortedMap from '../cache/sorted-map';
window.SortedMap = SortedMap;
const EmptyObject = emberRequire('ember-metal/empty_object');
window.EmptyObject = EmptyObject;
export default EmptyObject;
