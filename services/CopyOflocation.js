var mongodb = require('mongodb');
var assert = require('assert');
var objectId = require('mongodb').ObjectID;

// Get MongoDB connection from environmental or use local MongoDB instance
var vcap_services = process.env.VCAP_SERVICES;
var mongodb_service = JSON.parse(vcap_services).mongodb[0];
var url = mongodb_service.credentials.uri;

console.log("Mongo URL:" + url);

var MongoClient = mongodb.MongoClient;
const dbName = 'BFiAVVtRpx2T1I9J';

function loadLocation(app) {
	app.get("/isInsideGeoFence", (req, res) => {

	});
	app.get("/generate", (req, res) => {
		(async function () {
			const client = new MongoClient(url);
			try {
				await client.connect();
				console.log("Connected correctly to server");

				const db = client.db(dbName);

				// Insert a single document
				let r = await db.collection('inserts').insertOne({
					a: 1
				});
				assert.equal(1, r.insertedCount);

				// Insert multiple documents
				r = await db.collection('inserts').insertMany([{
					a: 2
				}, {
					a: 3
				}]);
				assert.equal(2, r.insertedCount);
			} catch (err) {
				console.log(err.stack);
			}

			res.send('Sucesso');
			// Close connection
			client.close();
		})();
	});

	// Handler for /items GET
	app.get("/items", function (req, res) {
		(async function () {
			const client = new MongoClient(url, {
				useNewUrlParser: true,
				useUnifiedTopology: true
			});
			try {
				await client.connect();
				console.log("Connected correctly to server");

				const db = client.db(dbName);

				// Get the collection
				var col = db.collection('inserts');
				col.find({}).toArray(function (err2, docs) {
					res.send(docs);
				});

			} catch (err) {
				console.log(err.stack);
			}
			// Close connection
			client.close();
		})();

	});

	app.post("/item", function (req, res) {
		const dbName = 'BFiAVVtRpx2T1I9J';
		(async function () {
			const client = new MongoClient(url, {
				useNewUrlParser: true,
				useUnifiedTopology: true
			});
			try {
				await client.connect();
				console.log("Connected correctly to server insert");

				const db = client.db(dbName);

				// Insert a single document
				let r = await db.collection('inserts').insertOne(req.body);
				assert.equal(1, r.insertedCount);
				res.send('Sucesso');

			} catch (err) {
				res.send(err.stack);
				console.log(err.stack);
			}

			// Close connection
			client.close();
		})();
	});
}

module.exports = loadLocation;