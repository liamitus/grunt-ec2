'use strict';

var _ = require('lodash');
var grunt = require('grunt');
var chalk = require('chalk');
var aws = require('./aws.js');

module.exports = function (instance_id, done) {

    var params = {
        Filters: [{ Name: 'instance-id', Values: [instance_id] }]
    }

    grunt.log.writeln('Looking up EC2 addresses matching %s...', chalk.cyan(instance_id));

    aws.log('ec2 describe-addresses --filters Name=instance-id,Values=%s', instance_id);
    aws.ec2.describeAddresses(params, aws.capture(parse));

    function parse (result) {
        if (!result) grunt.fatal('No addresses found matching ' + chalk.magenta(instance_id))
        var allocation_id = result.Addresses[0]['AllocationId']
        done(allocation_id);
    }
};

