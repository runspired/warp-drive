import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    let start = performance.now();
    console.log('record loading has begun at ', start);
    return this.get('store').findAll('item')
      .then((content) => {
        let end = performance.now();

        console.log('record loading ended at ', end);

        let diff = end - start;
        let avg = diff / content.length;

        console.log(content.length + ' records loaded in ' + diff + 'ms.  Average: ' + avg + 'ms');
        return content;
      });
  }
});
