import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
    x1: DS.attr('number'),
    y1: DS.attr('number'),
    x2: DS.attr('number'),
    y2: DS.attr('number'),

    px: DS.attr('number'),
    mm: DS.attr('number'),
    unit: DS.attr('string'),

    rev: DS.attr('string'),

    unitLength: Ember.computed('mm', 'unit', function()
    {
        // Get the unit
        let unit = this.get('unit');

        // Get the length in mm
        let mm = this.get('mm');

        // Create the variable to hold the unit length
        let unitLength = null;

        // Get the length of the set unit
        switch (unit) {
            case 'mm':

                // Get the amount of millimetres in the measurement
                unitLength = mm;

                break;

            case 'cm':

                // Get the amount of centimetres in the measurement
                unitLength = mm / 10;

                break;

            case 'in':

                // Get the amount of inches in the measurement
                unitLength = mm / 25.4;

                break;

            case 'ft':

                // Get the amount of foot in the measurement
                unitLength = mm / 304.8;

                break;

            case 'yd':

                // Get the amount of yards in the measurement
                unitLength = mm / 914.4;

                break;

            case 'm':

                // Get the amount of metres in the measurement
                unitLength = mm / 1000;

                break;
        }

        return unitLength;
    })
});
