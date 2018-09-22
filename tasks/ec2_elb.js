'use strict';

var chalk = require('chalk');
var util = require('util');
var conf  = require('./lib/conf.js');
var aws = require('./lib/aws.js');
var lookup = require('./lib/lookup.js');

module.exports = function (grunt) {
    var map = {
        attach: {
            cli: 'register-targets',
            sdk: 'registerTargets'
        },
        detach: {
            cli: 'deregister-targets',
            sdk: 'deregisterTargets'
        }
    };

    function register (action) {

        var taskName = 'ec2-elb-' + action;
        var capitalized = action[0].toUpperCase() + action.substr(1);
        var description = util.format('%s instances to an AWS ELB load balancer', capitalized);

        grunt.registerTask(taskName, description, function (name, elb) {
            conf.init(grunt);

            if (arguments.length === 0) {
                grunt.fatal([
                    'You should provide an instance name.',
                    'e.g: ' + chalk.yellow(util.format('grunt %s:instance-name:elb-name?', taskName))
                ].join('\n'));
            }

            var done = this.async();
            var balancer = elb || conf('AWS_ELB_NAME');
            if (balancer === void 0) {
                grunt.fatal([
                    'You should set the ELB name as option AWS_ELB_NAME, or pass it into the task.',
                    'e.g: ' + chalk.yellow(util.format('grunt %s:instance-name:elb-name?', taskName))
                ].join('\n'));
            }

            lookup(name, function (instance) {
                var cmd = map[action];
                var params = {
                    TargetGroupArn: balancer,
                    Targets: [{ Id: instance.InstanceId }]
                };

                grunt.log.writeln('%sing %s instance with %s ELB', capitalized, chalk.cyan(name), chalk.cyan(balancer));

                aws.log('elbv2 %s --target-group-arn %s --targets %s', cmd.cli, balancer, name);
                grunt.log.writeln('TEST ' + aws.elb[cmd.sdk]);
                grunt.log.writeln('TEST 2 ' + cmd.sdk);
                aws.elb[cmd.sdk](params, aws.capture('Done! Instance %sed.', action, done));
            });
        });
    }

    register('attach');
    register('detach');
};
