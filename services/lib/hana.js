var hana = require('@sap/hana-client');
const axios = require('axios')

const vcap_services = process.env.VCAP_SERVICES;
const hanadb_service = JSON.parse(vcap_services).hana[0];

let credentials = {
	serverNode: hanadb_service.credentials.host + ':' + hanadb_service.credentials.port,
	sslCryptoProvider: "openssl",
	sslTrustStore: hanadb_service.credentials.certificate,
	encrypt: true,
	schema: hanadb_service.credentials.schema,
	uid: hanadb_service.credentials.user,
	pwd: hanadb_service.credentials.password
};

// var client = hana.createClient();
// client.connect(credentials, function (err) {
// 	if (err) throw err;
// 	client.prepare('select * from DUMMY where DUMMY = ?', function (err, statement) {
// 		if (err) {
// 			return console.error('Error:', err);
// 		}
// 		// do something with the statement
// 		console.log('StatementId', statement.id);
// 		statement.exec(['X'], function (err, rows) {
// 			client.end();
// 			if (err) {
// 				return console.error('Error:', err);
// 			}
// 			console.log('Rows:', rows);
// 			return rows;
// 		});
// 	});
// });
module.exports = class HANA {
	constructor() {}
	select(query) {
		var client = hana.createConnection();
		client.connect(credentials);
		const result = client.exec(query);
		client.disconnect();

		return result;
	}
	prepareStatement(query, params) {
		var client = hana.createClient();
		client.connect(credentials, function (err) {
			if (err) throw err;
			client.prepare(query, function (err, statement) {
				if (err) {
					return console.error('Error:', err);
				}
				// do something with the statement
				console.log('StatementId', statement.id);
				statement.exec(params, function (err, rows) {
					client.end();
					if (err) {
						return console.error('Error:', err);
					}
					console.log('Rows:', rows);
					return rows;
				});
			});
		});
	}
	checkGeoFenceAccess(params) {
		var client = hana.createClient();
		client.connect(credentials, function (err) {
			if (err) throw err;
			client.prepare('SELECT * FROM  "ITRUCK"."tables.GeoFenceAccess" where "vehicleId"=? and "fence"=? and "leave" is null', function (
				err, statement) {
				if (err) throw err;
				statement.exec(params, function (err, rows) {
					client.end();
					if (err) throw err;

					if (rows.length < 1) {
						var client2 = hana.createClient();
						client2.connect(credentials, function (err) {
							if (err) throw err;
							client2.prepare('INSERT INTO "ITRUCK"."tables.GeoFenceAccess" values (?,now(),null,?)', function (err, statement) {
								if (err) throw err;
								statement.exec(params, function (err, rows2) {
									client2.end();
									if (err) throw err;

									axios.post('https://innovator-challenge-cf-lac-xsjs.cfapps.eu10.hana.ondemand.com/xsjs/Messages.xsjs', {
											'message': 'You has entered the location ' + params[1]
										})
										.then((res) => {
											console.log(`statusCode: ${res.status}`)
												//console.log(res)
										})
										.catch((error) => {
											console.error(error)
										})

									return "Cadastrada entrada";
								});
							});
						});
					} else {
						return "Ja estava cadastrada a entrada";
					}

				});
			});
		});
	}

	closeGeoFenceAccess(params) {
		var client = hana.createClient();
		client.connect(credentials, function (err) {
			if (err) throw err;
			client.prepare('SELECT * FROM  "ITRUCK"."tables.GeoFenceAccess" where "vehicleId"=? and "leave" is null', function (
				err, statement) {
				if (err) throw err;
				statement.exec(params, function (err, rows) {
					client.end();
					if (err) throw err;

					if (rows.length > 0) {
						var client2 = hana.createClient();
						client2.connect(credentials, function (err) {
							if (err) throw err;
							client2.prepare(
								'UPDATE "ITRUCK"."tables.GeoFenceAccess" set "leave"=now() where "vehicleId"=? and "leave" is null',
								function (err, statement) {
									if (err) throw err;
									statement.exec(params, function (err, rows2) {
										client2.end();

										axios.post('https://innovator-challenge-cf-lac-xsjs.cfapps.eu10.hana.ondemand.com/xsjs/Messages.xsjs', {
												'message': 'You has left the location ' + rows[0].fence
											})
											.then((res) => {
												console.log(`statusCode: ${res.status}`)
													//console.log(res)
											})
											.catch((error) => {
												console.error(error)
											})

										if (err) throw err;
										return "Cadastrada entrada";
									});
								});
						});

					}

					return "Registrou a saída";
				});
			});
		});
	}

	addMessage(vehicleId, msg) {
		console.log("Cadastrar mensagem");

	}
};