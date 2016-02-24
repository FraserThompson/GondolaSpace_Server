var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    _id: Number,
    pic: String,
    description: String,
    favorites: Array,
    following: Array,
    soundtrack: String
});

var User = mongoose.model('User', userSchema);

module.exports = User;