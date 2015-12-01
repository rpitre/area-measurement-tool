import DS from 'ember-data';
import Ember from 'ember';

export default DS.Transform.extend({
    deserialize: function(serialized) {
        return (Ember.isArray(serialized)) ? Ember.A(serialized): Ember.A();
    },

    serialize: function(deserialized) {
        return (Ember.isArray(deserialized)) ? Ember.A(deserialized): Ember.A();
    }
});
