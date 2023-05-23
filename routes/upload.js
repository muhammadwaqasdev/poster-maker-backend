const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;

const router = express.Router();

// Set up AWS SDK with your DigitalOcean Spaces credentials
const spacesEndpoint = new AWS.Endpoint('https://nyc3.digitaloceanspaces.com');

const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: 'DO00E9BTY7L8DB4JUW4R',
  secretAccessKey: 'b3MqjYAulrgDfyPzh7x5kD78EBCHTJOAmAvnHRUC8Cc'
});

const storage = multer.memoryStorage();
const upload = multer({ storage });


router.post('/uploadBackgrounds', upload.single('file'), function (req, res) {
    const file = req.file;
    const id = req.body.id;

  if (!(file && id)) {
    res.status(200).json({ status: 400, message: 'File and Id must be required' });
    return;
  }

  const params = {
    Bucket: 'posters-assets',
    Key: "backgrounds/" + id + ".png",
    Body: file.buffer,
    ContentType: 'image/png', 
    ACL: 'public-read',
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.error(err);
      res.status(200).json({ status: 500, message: 'Failed to upload background: ' + file.originalname});
    } else {
      res.status(200).json({ status: 200, message: 'Background uploaded successfully', data: data.Location });
    }
  });
});

router.post('/uploadStickers', upload.single('file'), function (req, res) {
    const file = req.file;
    const id = req.body.id;

  if (!(file && id)) {
    res.status(200).json({ status: 400, message: 'File and Id must be required' });
    return;
  }

  const params = {
    Bucket: 'posters-assets',
    Key: "stickers/" + id + ".png",
    Body: file.buffer,
    ContentType: 'image/png', 
    ACL: 'public-read',
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.error(err);
      res.status(200).json({ status: 500, message: 'Failed to upload Sticker: ' + file.originalname});
    } else {
      res.status(200).json({ status: 200, message: 'Sticker uploaded successfully', data: data.Location });
    }
  });
});

router.post('/uploadFonts', upload.single('file'), function (req, res) {
    const file = req.file;
    const id = req.body.id;

  if (!(file && id)) {
    res.status(200).json({ status: 400, message: 'File and Id must be required' });
    return;
  }

  const params = {
    Bucket: 'posters-assets',
    Key: "fonts/" + id + ".ttf",
    Body: file.buffer,
    ContentType: 'font/ttf', 
    ACL: 'public-read',
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.error(err);
      res.status(200).json({ status: 500, message: 'Failed to upload Font: ' + file.originalname});
    } else {
      res.status(200).json({ status: 200, message: 'Font uploaded successfully', data: data.Location });
    }
  });
});

module.exports = router;