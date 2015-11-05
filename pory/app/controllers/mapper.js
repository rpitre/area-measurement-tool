import Ember from 'ember';

export default Ember.Controller.extend({
    actions: {
        createLength(data)
        {
            // Create the length
            let length = this.store.createRecord('length', {
                x1: data.x1,
                y1: data.y1,
                x2: data.x2,
                y2: data.y2,
                px: data.px,
                mm: data.mm,
                unit: data.unit
            });

            // Save and return the created length
            return length.save();
        },

        deleteLength(id)
        {
            // Find the length
            this.store.findRecord('length', id).then(function(length)
            {
                // Destroy the record
                length.destroyRecord();
            });
        },

        editLengthUnit(data)
        {
            // Find the length
            this.store.findRecord('length', data.id).then(function(length)
            {
                // Update the length
                length.set("unit", data.unit);

                // Save the length
                length.save();
            });
        },

        deleteLengths()
        {
            // Find and destroy all the records
            this.store.findAll('length').then(function(lengths)
            {
                // Iterate through all lengths
                lengths.toArray().forEach(function(length)
                {
                    length.destroyRecord();
                });
            });
        }
    }
});
