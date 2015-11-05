import Ember from 'ember';

export default Ember.Component.extend({
    actions: {
        deleteLength()
        {
            // Get the id
            let id = this.length.id;

            // Pass the id up to the delete function of the mapper toolbox
            this.get('deleteLength')(id);
        },

        editUnit(unit)
        {
            // Get the id
            let id = this.length.id;

            // Create a data object containing the length's id and unit
            let data = {
                id: id,
                unit: unit
            };

            // Pass the data up to the edit unit function of the mapper toolbox
            this.get('editLengthUnit')(data);
        }
    }
});
