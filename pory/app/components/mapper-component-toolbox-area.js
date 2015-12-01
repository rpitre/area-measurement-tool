import Ember from 'ember';

export default Ember.Component.extend({

    tagName: '',

    actions: {
        deleteRecord()
        {
            // Get the id
            let id = this.area.id;

            // Pass the id up to the delete function of the mapper toolbox
            this.get('deleteArea')(id);
        },

        editUnit(unit)
        {
            // Get the id
            let id = this.area.id;

            // Create a data object containing the 's id and unit
            let data = {
                id: id,
                unit: unit
            };

            // Pass the data up to the edit unit function of the mapper toolbox
            this.get('editAreaUnit')(data);
        },

        highLight()
        {
            let id = this.area.id;

            this.get('highLightArea')(id);
        },

        unLight()
        {
            let id = this.area.id;

            this.get('unLightArea')(id);
        }
    }
});
