import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
    location: config.locationType
});

Router.map(function() {
  this.route('mapper');
});

Ember.Router.reopen({

    // If the application transitioned scroll to the top of the page
    didTransition: function(data) 
    {
        // Pass any data on
        this._super(data);

        // Scroll to the top of the page
        Ember.$('html, body').scrollTop(0);
    }
});

export default Router;
