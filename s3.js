const mongoose = require('mongoose');
const AWS = require('aws-sdk');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;

// Set up AWS SDK with your DigitalOcean Spaces credentials
const spacesEndpoint = new AWS.Endpoint('https://nyc3.digitaloceanspaces.com');

module.exports = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: 'DO007LYN8G6FVC8G82DA',
  secretAccessKey: 'YWYY3ZcIhzLI9eZ5MoG356LMn98I9nMEP8Oem181P4U'
});