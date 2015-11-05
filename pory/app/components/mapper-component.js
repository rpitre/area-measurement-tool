import Ember from 'ember';

export default Ember.Component.extend({
    canvas: null,

    mouseX: 0,
    mouseY: 0,

    initialMeasurementPoint1Coords: null,
    initialMeasurementPoint1Taken: false,

    initialMeasurementPoint2Coords: null,
    initialMeasurementPointsTaken: false,

    initialMeasurementLength: null,
    actualInitialMeasurement: null,
    initialMeasurementUnit: 'mm',

    measurementPoint1Coords: null,
    measurementPoint1Taken: false,

    measurementPoint2Coords: null,
    measurementPointsTaken: false,

    mm: null,

    lastUnit: 'mm',

    toolboxWarning: '',

    didInsertElement()
    {
        let canvas = this.get('canvas');

        // If it's not been initialized already initialize the canvas
        if (! canvas) {

            this.initializeCanvas();
        }
    },

    actions: {
        startOver()
        {
            // Reset the properties
            this.set('initialMeasurementPoint1Coords', null);
            this.set('initialMeasurementPoint2Coords', null);
            this.set('initialMeasurementPoint1Taken', false);
            this.set('initialMeasurementPointsTaken', false);
            this.set('initialMeasurementLength', null);
            this.set('initialMeasurementUnit', 'mm');
            this.set('mouseX', 0);
            this.set('mouseY', 0);

            // Get the canvas
            let canvas = this.get('canvas');

            // Make sure it's been initialized
            if (! canvas) {
                return;
            }

            // Iterate through all the canvas' objects
            canvas.forEachObject(function(obj)
            {
                // If it's not an image remove it
                if (obj.type !== 'image') {
                    canvas.remove(obj).renderAll();
                }
            });
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

            // Remove any errors
            this.set("toolboxWarning", "");

            // Get the canvas
            let canvas = this.get('canvas');

            // Iterate through all the canvas' objects
            canvas.forEachObject(function(obj)
            {
                // If it's not an image remove it
                if (obj.type !== 'image') {
                    canvas.remove(obj).renderAll();
                }
            });

            // Set the last unit
            this.set('lastUnit', initialMeasurementUnit);
        },

        deleteLength(id)
        {
            // Pass the id up to the controller
            this.get('deleteLength')(id);

            // Get the canvas
            let canvas = this.get('canvas');

            // Remove the measurement from the canvas
            canvas.remove(this.getCanvasObject(`${id}_point_1`)).renderAll();
            canvas.remove(this.getCanvasObject(`${id}_point_2`)).renderAll();
            canvas.remove(this.getCanvasObject(`${id}_join_line`)).renderAll();
        },

        editLengthUnit(data)
        {
            // Pass the data up to the controller
            this.get('editLengthUnit')(data);

            // Set the last unit
            this.set('lastUnit', data.unit);
        }
    },

    initializeCanvas()
    {
        let self = this;

        // Initiate the canvas
        let canvas = new fabric.Canvas('mapperCanvas');

        // Get the offset of the canvas
        let canvasOffset = Ember.$('#mapperCanvas').offset().top;

        // Get the height on the window's inner height
        let innerHeight = window.innerHeight;

        // Calculate the height of the canvas
        let canvasHeight = innerHeight - canvasOffset;

        // Set the height of the canvas
        canvas.setHeight(canvasHeight);

        // Set the height of the toolbox
        Ember.$('.col-toolbox').height(canvasHeight);

        // Get the width of the canvas' column
        let canvasColumnWidth = Ember.$('.col-canvas').width();

        // Set the width of the canvas
        canvas.setWidth(canvasColumnWidth);

        // Disable group selection
        canvas.selection = false;

        // Load the test image
        fabric.Image.fromURL('images/floorplan.jpg', function(img)
        {
            // Scale the image to the height of the canvas
            img.scaleToHeight(canvas.height);

            // Make it so the user can't interact with or select the image
            img.evented = img.selectable = false;

            // Set the X origin to the center of the image so we can center it
            img.originX = 'center';

            // Center the image
            img.left = canvas.width / 2;

            // Add the image to the canvas and rerender it
            canvas.add(img).renderAll();
        });

        // Bind an event to track the position of the cursor on the canvas
        canvas.on('mouse:move', function(options)
        {
            // Get the pointer
            let pointer = canvas.getPointer(options.e);

            // Set the X position of the mouse
            self.set('mouseX', pointer.x);

            // Set the Y position of the mouse
            self.set('mouseY', pointer.y);
        });

        // Bind an event to track when a user clicks on the canvas
        canvas.on('mouse:up', function(options)
        {
            // Get the length of 1mm
            let mm = self.get('mm');

            // The length of 1mm is set
            if (mm) {

                let firstPoint = (self.get('measurementPoint1Taken') === false);
                let secondPoint = (self.get('measurementPointsTaken') === false);

                // This is our first initial point
                if (firstPoint) {

                    // Set the first initial measurement point
                    self.setMeasurementPoint1(options);
                }

                // This is our second initial point
                else if (secondPoint) {

                    // Set the second initial measurement point
                    self.setMeasurementPoint2(options);
                }
            }

            // The length of 1mm isn't set yet
            else {

                let firstPoint = (self.get('initialMeasurementPoint1Taken') === false);
                let secondPoint = (self.get('initialMeasurementPointsTaken') === false);

                // This is our first initial point
                if (firstPoint) {

                    // Set the first initial measurement point
                    self.setInitialMeasurementPoint1(options);
                }

                // This is our second initial point
                else if (secondPoint) {

                    // Set the second initial measurement point
                    self.setInitialMeasurementPoint2(options);
                }
            }
        });

        // Set the default cursor to a crosshair
        canvas.defaultCursor = 'crosshair';

        // Set the canvas
        this.set('canvas', canvas);

        // Delete any existing lengths
        this.deleteLengths();
    },

    setInitialMeasurementPoint1()
    {
        let self = this;

        // Get the canvas
        let canvas = this.get('canvas');

        // Create the point
        let pointCoords = { 
            x: self.get('mouseX'),
            y: self.get('mouseY')
        };

        // Create a circle at our point
        let circle = new fabric.Circle({
            radius: 8,
            fill: 'white',
            left: pointCoords.x,
            top: pointCoords.y,
            originX: 'center',
            originY: 'center',
            stroke: '#0275d8',
            strokeWidth: 7,
            reference: 'initialMeasurementPoint1',
            hasControls: false,
            selectable: false
        });

        // Add the circle to the canvas and rerender it
        canvas.add(circle).renderAll();

        // Animate the circle
        circle.animate('radius', '+=5', {
            onChange: canvas.renderAll.bind(canvas),
            duration: 100,
            easing: fabric.util.ease.easeInCubic,
            
            onComplete: function()
            {
                circle.animate('radius', '-=5', {
                    onChange: canvas.renderAll.bind(canvas),
                    duration: 150,
                    easing: fabric.util.ease.easeOutCubic
                });
            }
        });

        // Set the first initial measurements coordinates
        this.set('initialMeasurementPoint1Coords', pointCoords);

        // Tell the app we've not set our first initial point
        this.set('initialMeasurementPoint1Taken', true);
    },

    setInitialMeasurementPoint2()
    {
        let self = this;

        // Get the canvas
        let canvas = this.get('canvas');

        // Create the point
        let pointCoords = { 
            x: self.get('mouseX'),
            y: self.get('mouseY')
        };

        // Create a circle at our point
        let circle = new fabric.Circle({
            radius: 8,
            fill: 'white',
            left: pointCoords.x,
            top: pointCoords.y,
            originX: 'center',
            originY: 'center',
            stroke: '#0275d8',
            strokeWidth: 7,
            reference: 'initialMeasurementPoint2',
            hasControls: false,
            selectable: false
        });

        // Add the circle to the canvas and rerender it
        canvas.add(circle).renderAll();

        // Animate the circle
        circle.animate('radius', '+=5', {
            onChange: canvas.renderAll.bind(canvas),
            duration: 100,
            easing: fabric.util.ease.easeInCubic,
            
            onComplete: function()
            {
                circle.animate('radius', '-=5', {
                    onChange: canvas.renderAll.bind(canvas),
                    duration: 150,
                    easing: fabric.util.ease.easeOutCubic
                });
            }
        });

        // Set the second initial measurements coordinates
        this.set('initialMeasurementPoint2Coords', pointCoords);

        // Tell the app we've not set our first initial point
        self.set('initialMeasurementPointsTaken', true);

        // Get the coordinates for our line
        let lineCoords = [
            this.get('initialMeasurementPoint1Coords.x'),
            this.get('initialMeasurementPoint1Coords.y'),
            this.get('initialMeasurementPoint2Coords.x'),
            this.get('initialMeasurementPoint2Coords.y')
        ];

        // Create a line to be drawn between the two points
        let line = new fabric.Line(lineCoords, {
            fill: '#5CB85C',
            stroke: '#5CB85C',
            strokeWidth: 6,
            selectable: false,
            originX: 'center',
            originY: 'center',
            reference: 'initialMeasurementJoinLine',
            hasControls: false
        });

        // Get the first point
        let firstPoint = this.getCanvasObject('initialMeasurementPoint1');

        // Get the index of the first point
        let firstPointIndex = canvas.getObjects().indexOf(firstPoint);

        // Add the line to the canvas and rerender it
        canvas.add(line).renderAll();

        // Move the line to below the first point
        line.moveTo(firstPointIndex);

        // Rerender the canvas
        canvas.renderAll();

        // Calculate the initial measurement length
        let initialMeasurementLength = Math.sqrt(
            Math.pow(line.x2 - line.x1, 2) + Math.pow(line.y1 - line.y2, 2)
        );

        // Set the initial measurement length
        this.set('initialMeasurementLength', initialMeasurementLength);
    },

    setMeasurementPoint1()
    {
        let self = this;

        // Get the canvas
        let canvas = this.get('canvas');

        // Create the point
        let pointCoords = { 
            x: self.get('mouseX'),
            y: self.get('mouseY')
        };

        // Create a circle at our point
        let circle = new fabric.Circle({
            radius: 8,
            fill: 'white',
            left: pointCoords.x,
            top: pointCoords.y,
            originX: 'center',
            originY: 'center',
            stroke: '#0275d8',
            strokeWidth: 7,
            reference: 'measurementPoint1',
            hasControls: false,
            selectable: false
        });

        // Add the circle to the canvas and rerender it
        canvas.add(circle).renderAll();

        // Animate the circle
        circle.animate('radius', '+=5', {
            onChange: canvas.renderAll.bind(canvas),
            duration: 100,
            easing: fabric.util.ease.easeInCubic,
            
            onComplete: function()
            {
                circle.animate('radius', '-=5', {
                    onChange: canvas.renderAll.bind(canvas),
                    duration: 150,
                    easing: fabric.util.ease.easeOutCubic
                });
            }
        });

        // Set the first measurements coordinates
        this.set('measurementPoint1Coords', pointCoords);

        // Tell the app we've not set our first point
        this.set('measurementPoint1Taken', true);
    },

    setMeasurementPoint2()
    {
        let self = this;

        // Get the canvas
        let canvas = this.get('canvas');

        // Create the point
        let pointCoords = { 
            x: self.get('mouseX'),
            y: self.get('mouseY')
        };

        // Create a circle at our point
        let circle = new fabric.Circle({
            radius: 8,
            fill: 'white',
            left: pointCoords.x,
            top: pointCoords.y,
            originX: 'center',
            originY: 'center',
            stroke: '#0275d8',
            strokeWidth: 7,
            reference: 'measurementPoint2',
            hasControls: false,
            selectable: false
        });

        // Add the circle to the canvas and rerender it
        canvas.add(circle).renderAll();

        // Animate the circle
        circle.animate('radius', '+=5', {
            onChange: canvas.renderAll.bind(canvas),
            duration: 100,
            easing: fabric.util.ease.easeInCubic,
            
            onComplete: function()
            {
                circle.animate('radius', '-=5', {
                    onChange: canvas.renderAll.bind(canvas),
                    duration: 150,
                    easing: fabric.util.ease.easeOutCubic
                });
            }
        });

        // Set the second measurements coordinates
        this.set('measurementPoint2Coords', pointCoords);

        // Tell the app we've not set our first point
        this.set('measurementPointsTaken', true);

        // Get the coordinates for our line
        let lineCoords = [
            this.get('measurementPoint1Coords.x'),
            this.get('measurementPoint1Coords.y'),
            this.get('measurementPoint2Coords.x'),
            this.get('measurementPoint2Coords.y')
        ];

        // Create a line to be drawn between the two points
        let line = new fabric.Line(lineCoords, {
            fill: '#5CB85C',
            stroke: '#5CB85C',
            strokeWidth: 6,
            selectable: false,
            originX: 'center',
            originY: 'center',
            reference: 'measurementJoinLine',
            hasControls: false
        });

        // Get the first point
        let firstPoint = this.getCanvasObject('measurementPoint1');

        // Get the index of the first point
        let firstPointIndex = canvas.getObjects().indexOf(firstPoint);

        // Add the line to the canvas and rerender it
        canvas.add(line).renderAll();

        // Move the line to below the first point
        line.moveTo(firstPointIndex);

        // Rerender the canvas
        canvas.renderAll();

        // Calculate the measurement length
        let measurementLength = Math.sqrt(
            Math.pow(line.x2 - line.x1, 2) + Math.pow(line.y1 - line.y2, 2)
        );

        // Set the measurement length
        this.set('measurementLength', measurementLength);

        // Get the length of 1mm
        let mm = this.get('mm');

        // Get the last unit
        let lastUnit = this.get('lastUnit');

        // Create a data object containing the length's data
        let data = {
            x1: this.get('measurementPoint1Coords.x'),
            y1: this.get('measurementPoint1Coords.y'),
            x2: this.get('measurementPoint2Coords.x'),
            y2: this.get('measurementPoint2Coords.y'),
            px: measurementLength,
            mm: measurementLength / mm,
            unit: lastUnit
        };

        // Create the length
        this.get('createLength')(data).then(function(length)
        {   
            // Set the reference of our points and like to that of our ID
            firstPoint.reference = `${length.id}_point_1`;
            circle.reference = `${length.id}_point_2`;
            line.reference = `${length.id}_join_line`;
        });

        // Reset the properties
        this.set('measurementPoint1Coords', null);
        this.set('measurementPoint2Coords', null);
        this.set('measurementPoint1Taken', false);
        this.set('measurementPointsTaken', false);
        this.set('measurementLength', null);
    },

    getCanvasObject(reference)
    {
        let object = null;

        // Get the canvas
        let canvas = this.get('canvas');

        // Make sure it's been initialized
        if (! canvas) {
            return object;
        }

        // Iterate through all the canvas' objects
        canvas.forEachObject(function(obj)
        {
            // We've found the object we were looking for
            if (obj.reference === reference) {
                object = obj;
            }
        });

        return object;
    },

    deleteLengths()
    {
        // Pass it up to the controller
        this.get('deleteLengths')();
    }
});
