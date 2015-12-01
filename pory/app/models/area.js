import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
    poly: DS.attr('data-array'),

    px: DS.attr('number'),

    // square millimetres
    s_mm: DS.attr('number'),
    unit: DS.attr('string'),

    rev: DS.attr('string'),

    unitArea: Ember.computed('s_mm', 'unit', function()
    {
        // Get the unit
        let unit = this.get('unit');

        // Get the area in s_mm
        let s_mm = this.get('s_mm');

        // Create the variable to hold the unit area
        let unitArea = null;

        // Get the area of the set unit
        switch (unit) {
            case 's_mm':

                // Get the amount of square millimetres in the measurement
                unitArea = s_mm;

                break;

            case 's_cm':

                // Get the amount of square centimetres in the measurement
                unitArea = s_mm / 100.0;

                break;

            case 's_in':

                // Get the amount of square inches in the measurement
                unitArea = s_mm / 645.16;

                break;

            case 's_ft':

                // Get the amount of square feet in the measurement
                unitArea = s_mm / 92903.04;

                break;

            case 's_yd':

                // Get the amount of square yards in the measurement
                unitArea = s_mm / 836127.36;

                break;

            case 's_m':

                // Get the amount of square metres in the measurement
                unitArea = s_mm / 1000000.0;

                break;
        }

        return unitArea;
    })
});
