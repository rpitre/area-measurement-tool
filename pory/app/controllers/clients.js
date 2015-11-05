import Ember from 'ember';

export default Ember.Controller.extend({
    actions: {
        createClient(data)
        {
            // Create the client
            let client = this.store.createRecord('client', {
                reference: data.reference,
                firstName: data.firstName,
                surname: data.surname
            });

            // Save the client
            client.save();

            // Create a response
            let response = {
                success: "You successfully created the client '"+data.firstName+" "+data.surname+"' with the reference '"+data.reference+"'."
            };

            return response;
        },

        deleteClient(id)
        {
            // Find the client
            this.store.findRecord('client', id).then(function(client)
            {
                // Destroy the record
                client.destroyRecord();
            });
        },

        editClient(data)
        {
            // Find the client
            this.store.findRecord('client', data.id).then(function(client)
            {
                // Update the client
                client.set("reference", data.reference);
                client.set("firstName", data.firstName);
                client.set("surname", data.surname);

                // Save the client
                client.save();
            });

            // Create a response
            let response = {
                success: "Your changes were successfully saved."
            };

            return response;
        }
    }
});
