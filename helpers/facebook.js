var secret = "x"; // this needs to be real
var appId = "x"; // so does this

var crypto = require('crypto');

var base64decode = function(data) {
    while (data.length % 4 !== 0) {
      data += '=';
    }
    data = data.replace(/-/g, '+').replace(/_/g, '/');
    return new Buffer(data, 'base64').toString('utf-8');
}

module.exports = {
	verify: function (req, res, next) {

		if (!req.headers.hasOwnProperty('authorization')) {
			console.log('No Facebook token!');
			console.log(req.headers);
			res.sendStatus(401);
		}

		var request = req.headers.authorization;
		var splitRequest = request.split('.');

		var sig = base64decode(splitRequest[0]);
		var data = JSON.parse(base64decode(splitRequest[1]))

		var expectedSig = crypto.createHmac("sha256", secret).update(splitRequest[1]).digest('base64').replace(/\//g, '_').replace(/\+/g, '-').replace(/\=/g, '');

		if (splitRequest[0] !== expectedSig) {
			console.log('Bad Signed JSON signature!');
			res.sendStatus(401)
		}

		req.user = {};
		req.user.facebook = data;
		next();
	}
}