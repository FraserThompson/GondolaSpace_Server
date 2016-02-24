var express = require('express');
var router = express.Router();
var User = require('../models/user');
var sharp = require('sharp');
var crypto = require('crypto');

var facebook = require('../helpers/facebook');

var mongoose = require('mongoose');

var fs = require('fs');

var multer  = require('multer');

var public_dir = 'public';
var profile_path = '/uploads/profile/';

var profileStorage = multer.diskStorage({
	destination: public_dir + profile_path,
	filename: function (req, file, cb) {
		cb(null, req.user.facebook.user_id + '.' + getExtension(file.originalname));
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

var getExtension = function (file) {
	var file_split = file.split('.');
	return file_split[file_split.length - 1];
}

var profileUpload = multer({ 
	storage: profileStorage,
	limits: {
		fileSize: '5000000',
		files: '1',
		fields: '1',
	},
	fileFilter: fileFilter
});


var deleteFile = function(path, callback) {
	console.log('deleting: ' + path)
	var newName = path + (Math.random() * 10);
	fs.renameSync(path, newName);
	fs.unlinkSync(newName);
}
/*
	Create a new user in the database if none exists already with that ID.
*/
router.post('/', facebook.verify, function (req, res) {
	User.findOne({_id: req.user.facebook.user_id}, function (err, user) {
		if (err) throw err;

		if (user){
			res.sendStatus(200);
			return;
		}

		var newUser = new User({
			_id: req.user.facebook.user_id,
			pic: "",
			description: "",
		    favorites: [],
		    following: [],
		    soundtrack: ""
		});

		newUser.save(function(err) {
		  if (err) throw err;
		  res.sendStatus(200);
		});

	});
});

router.get('/', function (req, res) {
	if (req.query.id) {
		User.findOne({_id: req.query.id}, function (err, user) {
		  if (err) throw err;
		  res.json(user);
		});
	} else {
		User.find(function (err, user) {
		  if (err) throw err;
		  res.json(user);
		});
	}

});

router.put('/', facebook.verify, function (req, res) {
	User.update({_id: req.user.facebook.user_id}, req.body.update, function (err, gondola) {
	  if (err) throw err;
	});
});

router.post('/pic', facebook.verify, function (req, res) {
	console.log(req.user.facebook);

	var img = req.body.pic.replace(/^data:image\/png;base64,/, "");
	var dest = profile_path + req.user.facebook.user_id + ".png";

	fs.writeFile(public_dir + dest, img, 'base64', function(err) {
	  	if (err) throw err;

		User.findOne({_id: req.user.facebook.user_id}, function (err, user) {
			if (err) throw err;

			user.pic = dest;

			user.save(function (err) {
				if (err) throw err;
				res.json(user);
	    	});
		});
	});
});

module.exports = router;
