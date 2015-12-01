import Ember from 'ember';

export default Ember.Route.extend({
    model: function()
    {
        return {
            lengths: this.get('store').findAll('length'),
            areas: this.get('store').findAll('area')
        };
    }
});
