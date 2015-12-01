import Ember from 'ember';

export default Ember.Component.extend({

    geomUtil: Ember.inject.service('geometry-util'),
    display: Ember.inject.service('display'),

    mouseX: Ember.computed.alias('display.mouseX'),
    mouseY: Ember.computed.alias('display.mouseY'),
    initialMeasurementPoint1Coords: Ember.computed.alias('display.initialFirstPoint'),
    initialMeasurementPoint2Coords: Ember.computed.alias('display.initialSecondPoint'),
    initialMeasurementLength: Ember.computed.alias('display.initialMeasurementLength'),
    displayWarning: Ember.computed.alias('display.displayWarning'),

    previousSegment: null,
    invalidSegment: false,

    initialMeasurementPoint1Taken: false,
    initialMeasurementPointsTaken: false,

    actualInitialMeasurement: null,
    initialMeasurementUnit: 'mm',

    measurementSelection: 'length',

    mm: null,
    s_mm: null,

    lastLengthUnit: 'mm',
    lastAreaUnit: 's_mm',

    toolboxWarning: '',

    /*---------- Proprieties to observe ----------------------*/
    // Any warning sent by the display service if forwarded to the toolboxWaring
    displayWarningChange: function() {
        this.set('toolboxWarning', this.get('displayWarning'));
    }.observes('displayWarning'),

    initialMeasurementPoint1Change:  function() {
      let point = this.get('initialMeasurementPoint1Coords');
      if (point) {
          this.set('initialMeasurementPoint1Taken', true);
      }
    }.observes('initialMeasurementPoint1Coords'),

    initialMeasurementPoint2Change:  function() {
        let point = this.get('initialMeasurementPoint2Coords');
        if (point) {
            this.set('initialMeasurementPointsTaken', true);
        }
    }.observes('initialMeasurementPoint2Coords'),

    // When user changes the typeof measurements he wants to do, this method
    // is called. It sets the display event callbacks to the appropriate ones.
    measurementSelectionChange: function() {
       // let self = this;

        if (this.get('measurementSelection') === 'length') {
            this.get('display').setDisplayForLengthMeasurements((pt1, pt2) => this.recordLength(pt1, pt2));
        } else {
            this.get('display').setDisplayForAreaMeasurements(polyline => this.recordArea(polyline));
        }
    }.observes('measurementSelection'),
    /*------------------------------------------------------------------------*/

    didInsertElement()
    {
        this.initialize();
    },

    actions: {
        startOver()
        {
            this.set('initialMeasurementPoint1Taken', false);
            this.set('initialMeasurementPointsTaken', false);
            this.set('initialMeasurementUnit', 'mm');
            this.set('measurementSelection', 'length');
            this.get('display').deleteAllDisplayedMeasurements();
            this.get('display').startOver();
        },

        setRatio()
        {
            // Get the initial measurement length
            let initialMeasurementLength = this.get('initialMeasurementLength');

            // Get the actual initial measurement
            let actualInitialMeasurement = this.get('actualInitialMeasurement');

            // Make sure they've entered an actual measurement
            if (! actualInitialMeasurement) {

                // Tell them to enter the measurement length
                this.set("toolboxWarning", "Enter the length to continue.");

                return;
            }

            // Get the initial measurement unit
            let initialMeasurementUnit = this.get('initialMeasurementUnit');

            // Get the length of 1mm
            let actualInitialMeasurementInMm = null;

            switch (initialMeasurementUnit) {
                case 'mm':

                    // Get the amount of millimetres in the measurement
                    actualInitialMeasurementInMm = actualInitialMeasurement;

                    break;

                case 'cm':

                    // Get the amount of millimetres in the measurement
                    actualInitialMeasurementInMm = actualInitialMeasurement * 10;

                    break;

                case 'in':

                    // Get the amount of millimetres in the measurement
                    actualInitialMeasurementInMm = actualInitialMeasurement * 25.4;

                    break;

                case 'ft':

                    // Get the amount of millimetres in the measurement
                    actualInitialMeasurementInMm = actualInitialMeasurement * 304.8;

                    break;

                case 'yd':

                    // Get the amount of millimetres in the measurement
                    actualInitialMeasurementInMm = actualInitialMeasurement * 914.4;

                    break;

                case 'm':

                    // Get the amount of millimetres in the measurement
                    actualInitialMeasurementInMm = actualInitialMeasurement * 1000;

                    break;
            }

            // Divide the measurement by the amount of millimetres we have
            let mm = initialMeasurementLength / actualInitialMeasurementInMm;

            // Set the length of 1mm
            this.set('mm', mm);

            // Set the area of 1 s_mm (square millimetres)
            this.set('s_mm', mm * mm);

            // Remove any errors
            this.set("toolboxWarning", "");

            this.get('display').deleteAllDisplayedMeasurements();

            // Set the last unit
            this.set('lastLengthUnit', initialMeasurementUnit);

            // The resolution calculation is done, we can now make measurements
            // This call will setup the display callbacks which depend on the current
            // measurement type setting (length or area)
            this.measurementSelectionChange();

        },

        deleteLength(id)
        {
            // Pass the id up to the controller
            this.get('deleteDataLength')(id);

            this.get('display').deleteLength(id);

        },

        editLengthUnit(data)
        {
            // Pass the data up to the controller
            this.get('editDataLengthUnit')(data);

            // Set the last unit
            this.set('lastLengthUnit', data.unit);
        },

        deleteArea(id)
        {
          // Pass the id up to the controller
          this.get('deleteDataArea')(id);

          this.get('display').deleteArea(id);
        },

        editAreaUnit(data)
        {
          // Pass the data up to the controller
          this.get('editDataAreaUnit')(data);

          // Set the last unit
          this.set('lastAreaUnit', data.unit);
        },

        highLightArea(id)
        {
            this.get('display').highLightArea(id);
        },

        highLightLength(id)
        {
            this.get('display').highLightLength(id);
        },

        unLightArea(id)
        {
          this.get('display').unLightArea(id);
        },

        unLightLength(id)
        {
            this.get('display').unLightLength(id);
        }

    },

    initialize()
    {
        this.deleteAllData();

        this.get('display').initDisplay();
        this.get('display').setDisplayForResolutionMeasurement();
    },

    recordArea(polyline)
    {
        // Calculate the surface
        let measurementArea = this.get('geomUtil').calculatePolygonArea(polyline);

        // Get the area of 1 square mm
        let s_mm = this.get('s_mm');

        // Get the last unit
        let lastAreaUnit = this.get('lastAreaUnit');

        // Create a data object containing the area's data
        let data = {
            poly:  polyline,
            px: measurementArea,
            s_mm: measurementArea / s_mm,
            unit: lastAreaUnit
        };

        return this.get('createDataArea')(data);
    },

    recordLength(pt1, pt2)
    {
        // Calculate the measurement length
        let measurementLength = Math.sqrt(
            Math.pow(pt1.x - pt2.x, 2) + Math.pow(pt1.y - pt2.y, 2)
        );

        // Get the length of 1mm
        let mm = this.get('mm');

        // Get the last unit
        let lastLengthUnit = this.get('lastLengthUnit');

        // Create a data object containing the length's data
        let data = {
            x1: pt1.x,
            y1: pt1.y,
            x2: pt2.x,
            y2: pt2.y,
            px: measurementLength,
            mm: measurementLength / mm,
            unit: lastLengthUnit
        };

        return this.get('createDataLength')(data);
    },

    deleteDataLengths()
    {
        // Pass it up to the controller
        this.get('deleteDataLengths')();
    },

    deleteDataAreas()
    {
      // Pass it up to the controller
      this.get('deleteDataAreas')();
    },

    deleteAllData()
    {
        this.deleteDataLengths();
        this.deleteDataAreas();
    }
});
