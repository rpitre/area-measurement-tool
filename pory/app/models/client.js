import DS from 'ember-data';

export default DS.Model.extend({
    reference: DS.attr('string'),
    firstName: DS.attr('string'),
    surname: DS.attr('string'),
    rev: DS.attr('string')
});
