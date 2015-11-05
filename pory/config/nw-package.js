module.exports = {
    
    // The name of the app
    appName: "Measurement Tool",
    
    // Supported platforms to be built
    platforms: ['linux32', 'win32'],
    
    // Set the NW.js version
    version: '0.12.3',

    // Set the app version
    appVersion: '0.0.0',
    
    buildType: function()
    {
        return this.appVersion;
    }
};