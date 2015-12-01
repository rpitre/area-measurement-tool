import Ember from 'ember';

export default Ember.Controller.extend({
    actions: {
        createDataLength(data)
        {
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

        createDataArea(data)
        {

            // Clone the data, it seems that the store
            // keeps reference to its data.
            let tmpArray = data.poly.map(obj => {
                let newObj = {};
                newObj.x = obj.x;
                newObj.y = obj.y;
                return newObj;
            });

            let area = this.store.createRecord('area', {
                poly: tmpArray,
                px: data.px,
                s_mm: data.s_mm,
                unit: data.unit
             });

            // Save and return the created area
            return area.save();
        },

        deleteDataLength(id)
        {
            this.store.findRecord('length', id).then(length => {
                length.destroyRecord();
            });
        },

        deleteDataArea(id)
        {
              this.store.findRecord('area', id).then(area => {
                  area.destroyRecord();
              });
        },

         editDataLengthUnit(data)
        {
            this.store.findRecord('length', data.id).then(length => {
                length.set("unit", data.unit);
                length.save();
            });
        },

        editDataAreaUnit(data)
        {
            // Find the area
            this.store.findRecord('area', data.id).then(area => {
                area.set("unit", data.unit);
                area.save();
            });
        },

        deleteDataLengths()
        {
            // Find and destroy all the records
            this.store.findAll('length').then(lengths => {
                lengths.toArray().forEach(length => {
                    length.destroyRecord();
                });
            });
        },

        deleteDataAreas()
        {
            this.store.findAll('area').then(areas => {
                areas.toArray().forEach(area => {
                    area.destroyRecord();
                });
            });
        }
    }
});
