var express = require('express');
var router = express.Router();
var Gondola = require('../models/gondola');
var User = require('../models/user');

var facebook = require('../helpers/facebook');
var sharp = require('sharp');

var mongoose = require('mongoose');

var fs = require('fs');

var multer  = require('multer')

var gondolaPath = 'public/uploads/gondola/';

var gondolaStorage = multer.diskStorage({
	destination: gondolaPath,
	filename: function (req, file, cb) {
		cb(null, file.originalname)
	}
});

var fileFilter = function (req, file, cb) {
	var okayTypes = ['image/jpeg', 'image/png'];

	if (okayTypes.indexOf(file.mimetype) > -1){
  		cb(null, true);
  	} else {
  		cb(null, false);
  	}
}

var gondolaUpload = multer({ 
	storage: gondolaStorage,
	limits: {
		fileSize: '6000000',
		files: '1',
		fields: '1',
	},
	fileFilter: fileFilter
});

router.delete('/', function (req, res) {
	var query = {};

	Gondola.remove(query, function() {
		User.remove(query, function() {
			res.send("removed all");
		});
	});

});

router.get('/', function (req, res) {
	var query = {};
	if (req.query.id) query._id = req.query.id;
	if (req.query.owner) query.owner = req.query.owner;

	console.log(query);

	if (req.query.random) {
		Gondola.random(function (err, gondola) {
			if (err) throw err;
			res.json(gondola);
		});
	} else {
		Gondola.find(query, function (err, gondolas) {
		  if (err) throw err;
		  res.json(gondolas);
		});
	}
});

router.post('/', facebook.verify, gondolaUpload.single('gondola'), function (req, res) {
	var file_split = req.file.filename.split(".");
	var thumbnail = file_split[0] + "_thumb." + file_split[1]
	var resized = null;

	var newGondola = new Gondola({
		owner: req.user.facebook.user_id,
		file: { "original": req.file.filename, "thumbnail": thumbnail },
		voted: {
			umami: 0,
		    notUmami: 0,
		},
		flavours: {
		    sweet: 0,
		    salty: 0,
		    sour: 0,
		    bitter: 0
		},
		flagged: false
	});

  	sharp(req.file.path)
	  .resize(800, 800)
	  .max()
	  .toFile(req.file.destination + thumbnail, function(err) {
	  	if (err) throw err;
	  	newGondola.save(function (err, gondola) {
		  	if (err) throw err;
	  		res.json(gondola);
		});
	});

	if (req.file.size > 2000000){
		req.file.filenam = file_split[0] + "_r." + file_split[1]
		sharp(req.file.path)
		  .resize(2000, 1600)
		  .max()
		  .toFile(req.file.destination + resized, function (err) {
		  	if (err) throw err;
	  		// fs.unlink(req.file.path);
		});
	}

});

router.put('/', function (req, res) {
	Gondola.findById(req.body.id, function (err, gondola) {
		if (err) throw err;

		if (req.body.flavours) {
			gondola.flavours = req.body.flavours;
		}
		if (req.body.voted){
			gondola.voted = req.body.voted;
		}

		gondola.save();
		res.json(gondola);
	});
});

module.exports = router;
