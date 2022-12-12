const PORT = 8080;
const HOST = '0.0.0.0';

const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const fs = require('fs');
const path = require('path');

const imgModel = require('./image.model')

var multer = require('multer');

var storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads')
	},
	filename: (req, file, cb) => {
		cb(null, file.fieldname + '-' + Date.now())
	}
});

var upload = multer({ storage: storage });


mongoose.connect("mongodb://localhost:27017/potholes",
    { useNewUrlParser: true, useUnifiedTopology: true }, err => {
        console.log('connected')
    });



// App
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
 
// Set EJS as templating engine

app.set("view engine", "ejs");

app.get('/', (req, res) => {
    res.send('Hello World');
});
app.get('/map', (req, res) => {
    res.render('map')
});

app.get('/images', (req, res) => {
	imgModel.find({}, (err, items) => {
		if (err) {
			console.log(err);
			res.status(500).send('An error occurred', err);
		}
		else {
			res.render('imagesPage', { items: items });
		}
	});
});

app.post('/upload', upload.single('image'), (req, res, next) => {
	locationJson = JSON.parse(req.body.location)

	var obj = {
		name: req.body.name,
		desc: req.body.desc,
		img: {
			data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
			contentType: 'image/png'
		},
		location: {
			type: locationJson.type,
			coordinates: locationJson.coordinates
		}
	}
	imgModel.create(obj, (err, item) => {
		if (err) {
			console.log(err);
		}
		else {
			res.redirect('/images');
		}
	});
});


app.listen(PORT, HOST, () => {
    console.log(`Running on http://${HOST}:${PORT}`);
});

