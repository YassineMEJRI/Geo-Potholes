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
    imgModel.find({},'_id name desc location.type location.coordinates', (err, images) => {
		if (err) {
			console.log(err);
			res.status(500).send('An error occurred', err);
		}
		else {
			res.render('map', { images: images });
		}
	});
});

app.get('/potholes', (req, res) => {
    imgModel.find({},'_id name desc img location.type location.coordinates', (err, images) => {
		if (err) {
			console.log(err);
			res.status(500).send('An error occurred', err);
		}
		else {
			res.setHeader('Content-Type', 'application/json');
			res.json(images);
		}
	});
});

app.get('/pothole_picture/:potId', function(req, res, next) {
	imgModel.findOne({
	  _id: req.params.potId
	}).then(function(img) {
	  res.status(200).send(img.img.data);
	});
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
	
	var obj = {
		name: req.body.name,
		desc: req.body.desc,
		img: {
			data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
			contentType: 'image/png'
		},
		location: {
			type: "Point",
			coordinates:[ req.body.longitude, req.body.latitude]
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

