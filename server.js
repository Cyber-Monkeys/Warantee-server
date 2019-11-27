var admin = require('firebase-admin');
var express = require('express');
var bodyParser = require("body-parser");
var app = express();
const port = 3000;
var config = require('./config');
const fs = require('fs');
const http = require('http');
var Waranty = require('./models/waranty');
const multer = require('multer');

const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const BUCKET_NAME = 'storage-warantee';

const awsconfig = require('./aws_config');


const s3 = new AWS.S3(awsconfig);

    const uploadPhoto = multer({
	storage: multerS3({
            s3: s3,
            bucket: BUCKET_NAME,
            metadata: function (req, file, cb) {
                cb(null, { fieldName: file.fieldname });
            },
            key: function (req, file, cb) {
                console.log("uploading photo", req.get("WarantyId"));
                cb(null, req.authId + req.get("WarantyId") + ".jpg");
            }
   		})
	});
	const uploadVideo = multer({
	storage: multerS3({
            s3: s3,
            bucket: BUCKET_NAME,
            metadata: function (req, file, cb) {
                cb(null, { fieldName: file.fieldname });
            },
            key: function (req, file, cb) {
                cb(null, req.authId + req.get("WarantyId") + ".mp4");
            }
   		})
	});


// const params = {
//     Bucket: BUCKET_NAME,
//     CreateBucketConfiguration: {
//         // Set your region here
//         LocationConstraint: "eu-west-1"
//     }
// };

// s3.createBucket(params, function(err, data) {
//     if (err) console.log(err, err.stack);
//     else console.log('Bucket Created Successfully', data.Location);
// });
// DATABASE

var supersecret = require('./config');

var Sequelize = require('sequelize');
var sequelize = new Sequelize('Warantee', 'root', supersecret.dbPassword, {
  host: 'localhost',
  dialect: 'mysql',
});

sequelize
  .authenticate()
  .then(function(err) {
    console.log('Connection established successfully!');
  })
  .catch(function(err) {
    console.log('Unable to connect to the database:', err);
  });

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(express.json());

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://warantee-csit242.firebaseio.com'
});

app.use(async function(req, res, next) {
	console.log("middleware");
    try {
      const authToken = req.get('AuthToken');
      console.log("authenticated", authToken);
      const userInfo = await admin
        .auth()
        .verifyIdToken(authToken);
      console.log("authenticated", userInfo.uid);
      req.authId = userInfo.uid;
      next();
    } catch (e) {
		console.log("not authenticated");
      res
        .status(401)
        .send({ error: 'You are not authorized to make this request' });
    }
})
app.post('/cool', function(req, res) {
	console.log("cool endpoint reached");
	console.log("uid", req.auth);
    Waranty.findAll({}).
    then(function(waranties) {
    	console.log(JSON.stringify(waranties));
    	res.status(200);
     	res.send(waranties);
	});
});

app.get('/login', function(req, res) {
	console.log('login endpoint reached')
	res.status(200);
	res.send({failure:'failed'});
});

app.get('/download', function(req, res) {
	console.log('wow endpoint reached');
	console.log("uid", req.authId);
	res.download('uploads/wow.jpg');
  res.status(200).send('Download Complete');
});


app.post('/photo', uploadPhoto.any(), function (req, res, next) {
	console.log("photo endpoint reached")
	console.log(req.files);
  res.end();
});
app.post('/video', uploadVideo.any(), function (req, res, next) {
	console.log("video endpoint reached")
	console.log(req.files);
  res.end();
});
app.get('/waranty', function(req, res, next) {
  console.log("waranty get request");
	return Waranty.findAll({
		where: {
			uid: req.authId
		}
	}).then(function (waranty) {
	  	console.log(JSON.stringify(waranty));
        if (waranty) {
        	console.log("waranty retrieved succesfully");
            res.send(waranty);
        } else {
        	console.log("waranty not retrieved");
            res.status(400).send('Error in insert new record');
        }
    });
})
app.post('/waranty', function(req, res, next) {
	console.log("posting waranty endpoint reached");
	console.log(req.body.sellerPhone);
	return Waranty.create({
	    uid: req.authId,
	    date: req.body.date,
	    amount: req.body.amount,
	    category: req.body.category,
	    warantyPeriod: req.body.warantyPeriod,
	    sellerName: req.body.sellerName,
	    sellerPhone: req.body.sellerPhone,
	    sellerEmail: req.body.sellerEmail,
      location: req.body.location

	  }).then(function (waranty) {
	  	console.log(JSON.stringify(waranty));
        if (waranty) {
        	console.log("waranty added succesfully");
            res.send(waranty);
        } else {
        	console.log("waranty not added");
            res.status(400).send('Error in insert new record');
        }
    });
})

app.get('/testAWS', function(req, res, next) {
	const fileContent = fs.readFileSync('./uploads/wow.jpg');

    // Setting up S3 upload parameters
    const params = {
        Bucket: BUCKET_NAME,
        Key: 'cat.jpg', // File name you want to save as in S3
        Body: fileContent
    };

    // Uploading files to the bucket
    s3.upload(params, function(err, data) {
        if (err) {
            throw err;
        }
        console.log(`File uploaded successfully. ${data.Location}`);
        res.status(200).send('File uploaded successfully');
    });
    res.status(400).send('Error in insert new record');
});


app.get('/s3Proxy', function(req, res, next){
    // download the file via aws s3 here
    var fileKey = req.query['fileKey'];

    console.log('Trying to download file', fileKey);
    var options = {
        Bucket    : BUCKET_NAME,
        Key    : fileKey,
    };

    res.attachment(fileKey);
    var fileStream = s3.getObject(options).createReadStream();
    fileStream.pipe(res);
    res.status(200).send('file downloaded successfully');
});


app.get('/update', function(req, res, next) {
  console.lo('update in progress');
   Waranty.decrement(['warantyPeriod', '2'], { where: { uid: req.authId } });
   res.status(200).send('Error in insert new record');
});

const server = http.createServer(app);
server.listen(port, function() {
  console.log('Server is now connected on port ' + port);
}).on('error', function(err) {
  console.log('err:', err);
});
