var Swarm = require('rolling-spider').Swarm;
var temporal = require('temporal');
var swarm = new Swarm({
    timeout: 10
});

swarm.assemble();

swarm.on('assembled', function() {

    temporal.queue([{
        delay: 2000,
        task: function() {
            swarm.flatTrim();
            swarm.takeOff();
            swarm.hover();
        }
    }, {
        delay: 5000,
        task: function() {
            swarm.land();
        }
    }, {
        delay: 5000,
        task: function() {
            temporal.clear();
            process.exit(0);
        }
    }]);
});
