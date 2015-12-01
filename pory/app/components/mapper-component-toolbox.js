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
        },

        highLightLength(id)
        {
            this.get('highLightLength')(id);
        },

        unLightLength(id)
        {
            this.get('unLightLength')(id);
        },

        deleteArea(id)
        {
            // Pass the id up to the controller
            this.get('deleteArea')(id);
        },

        editAreaUnit(data)
        {
          // Pass the data up to the controller
            this.get('editAreaUnit')(data);
        },

        highLightArea(id)
        {
            this.get('highLightArea')(id);
        },

        unLightArea(id)
        {
            this.get('unLightArea')(id);
        }

    }
});
