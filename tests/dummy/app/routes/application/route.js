import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return this.get('store').findAll('bar')
      .then((content) => {
        console.log('model', content);
        return content;
      });
  }
});
