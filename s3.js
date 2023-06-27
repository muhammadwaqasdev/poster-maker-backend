const mongoose = require('mongoose');
const AWS = require('aws-sdk');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;

// Set up AWS SDK with your DigitalOcean Spaces credentials
const spacesEndpoint = new AWS.Endpoint('https://nyc3.digitaloceanspaces.com');

module.exports = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: 'DO00E9BTY7L8DB4JUW4R',
  secretAccessKey: 'b3MqjYAulrgDfyPzh7x5kD78EBCHTJOAmAvnHRUC8Cc'
});