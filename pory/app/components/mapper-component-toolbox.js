import Ember from 'ember';

export default Ember.Component.extend({
    actions: {
        startOver()
        {
            // Pass it on to the parent
            this.get('startOver')();
        },

        setRatio()
        {
            // Pass it on to the parent
            this.get('setRatio')();
        },

        deleteLength(id)
        {
            // Pass the id up to the controller
            this.get('deleteLength')(id);
        },

        editLengthUnit(data)
        {
            // Pass the data up to the controller
            this.get('editLengthUnit')(data);
        }
    }
});
