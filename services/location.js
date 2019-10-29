const mongodb = require('mongodb');
const assert = require('assert');
const objectId = require('mongodb').ObjectID;
const HANA = require('./lib/hana.js');
const saslprep = require('saslprep');

// Get MongoDB connection from environmental or use local MongoDB instance
//const vcap_services = process.env.VCAP_SERVICES;
//const mongodb_service = JSON.parse(vcap_services).mongodb[0];
//const url = mongodb_service.credentials.uri;
const url = 'mongodb://HvTfU_H3ppTWMxoS:IWf_EhShCG5qF0kr@10.11.241.37:58997/aZfmUMnGISIwVYXY';

//console.log("Mongo URL:" + url);

const MongoClient = mongodb.MongoClient;
const dbName = 'aZfmUMnGISIwVYXY';

function loadLocation(app) {
	app.post("/isInsideGeoFence", (req, res) => {
		(async function () {
			const client = new MongoClient(url, {
				useNewUrlParser: true,
				useUnifiedTopology: true
			});
			try {
				await client.connect();
				//console.log("Connected correctly to server");

				const db = client.db(dbName);

				// Get the collection
				const col = db.collection('locations');
				col.find({
					geometry: {
						$geoIntersects: {
							$geometry: {
								"type": "Point",
								"coordinates": [req.body.lon, req.body.lat]
							}
						}
					}
				}).toArray(function (err2, docs) {
					if (docs && docs.length > 0) {
						for (let i = 0; i < docs.length; i++) {
							const item = docs[i];
							const hana = new HANA();
							const result = hana.checkGeoFenceAccess([req.body.vehicleId, item.name]);
							console.log(result);
							// const result = hana.prepareStatement(
							// 	'SELECT * FROM  "ITRUCK"."tables.GeoFenceAccess" where "vehicleId"=? and "fence"=? and "leave" is null', [req.body.vehicleId, item.name]
							// );
							// console.log(result);
							// //Se encontrou não faz nada, se não encontrou criar um nova entrada na tabela tables.GeoFenceAccess
							// if (result === undefined || result.length < 1) {
							// 	console.log("Registrando entrada GeoFence");
							// 	const result = hana.prepareStatement(
							// 		'INSERT INTO "ITRUCK"."tables.GeoFenceAccess" values (?,now(),null,?)', [req.body.vehicleId, item.name]);
							// 	console.log(result);
							// } else {
							// 	console.log("Ja registrada entrada GeoFence");
							// }
							
						}
					}
					res.send(docs);

				});

			} catch (err) {
				console.log(err.stack);
			}
			// Close connection
			client.close();
		})();
	});

	// Handler for /items GET
	app.get("/location", function (req, res) {
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
				const col = db.collection('locations');
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

	app.delete("/location", function (req, res) {
		(async function () {
			const client = new MongoClient(url, {
				useNewUrlParser: true,
				useUnifiedTopology: true
			});
			try {
				await client.connect();
				console.log("Connected correctly to server delete");

				const db = client.db(dbName);

				// Insert a single document
				if (req.body._id) {
					let r = await db.collection('locations').deleteOne({
						_id: req.body._id
					});
					res.send('Excluido com Sucesso');
				}
			} catch (err) {
				res.send(err.stack);
				console.log(err.stack);
			}

			// Close connection
			client.close();

		})();
	});

	app.post("/location", function (req, res) {
		(async function () {
			const client = new MongoClient(url, {
				useNewUrlParser: true,
				useUnifiedTopology: true
			});
			try {
				await client.connect();
				console.log("Connected correctly to server update");

				const db = client.db(dbName);

				// Insert a single document
				if (req.body._id) {
					let r = await db.collection('locations').updateOne({
						_id: req.body._id
					}, {
						$set: req.body,
						$currentDate: {
							lastModified: true
						}
					});
					res.send('Atualizado com Sucesso');
				} else {
					let r = await db.collection('locations').insertOne(req.body);
					assert.equal(1, r.insertedCount);
					res.send('Criado com Sucesso');
				}

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