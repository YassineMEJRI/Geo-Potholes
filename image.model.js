var mongoose = require('mongoose');

var imageSchema = new mongoose.Schema({
	name: String,
	desc: String,
	date_added: Date,
	state: String,
	date_fixed: Date,
	img:
	{
		data: Buffer,
		contentType: String
	},
	location: mongoose.Schema({
		type: String,
		coordinates: [[[Number]]]
	  })
});

//Image is a model which has a schema imageSchema

module.exports = new mongoose.model('Image', imageSchema);
