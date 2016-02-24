var mongoose = require('mongoose');

var gondolaSchema = mongoose.Schema({
    owner: String,
    file: { 
    	original: String,
    	thumbnail: String,
    },
    voted: {
	    umami: Number,
	    notUmami: Number
    },
    flavours: {
	    sweet: Number,
	    salty: Number,
	    sour: Number,
	    bitter: Number
	},
    flagged: Boolean
}, { timestamps: true });

gondolaSchema.statics.random = function(callback) {
  this.count(function(err, count) {
    if (err) {
      return callback(err);
    }
    var rand = Math.floor(Math.random() * count);
    this.findOne().skip(rand).exec(callback);
  }.bind(this));
};

var Gondola = mongoose.model('Gondola', gondolaSchema);

module.exports = Gondola;