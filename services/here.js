const https = require("https");

var config = {
	app_id: "TdAHcqE1TY0mC2pWIGWc",
	app_code: "83MFkA276Ge19RUdQI17nw"
};

function loadHere(app) {
	app.get("/eta", (req, res) => {
		var point1 = req.query.lat1 + "," + req.query.lon1;
		var point2 = req.query.lat2 + "," + req.query.lon2;

		if (point1 === undefined || point2 === undefined) {
			throw new Error("BROKEN");
		}

		// define the promise
		let request_call = new Promise((resolve, reject) => {
			https.get("https://route.api.here.com/routing/7.2/calculateroute.json?app_id=" + config.app_id + "&app_code=" + config.app_code +
				"&waypoint0=geo!" + point1 + "&waypoint1=geo!" + point2 + "&mode=fastest;car;traffic:disabled", (
					response) => {
					let chunks_of_data = [];

					response.on("data", (fragments) => {
						chunks_of_data.push(fragments);
					});

					response.on("end", () => {
						let response_body = Buffer.concat(chunks_of_data);

						// promise resolved on success
						resolve(response_body.toString());
					});

					response.on("error", (error) => {
						// promise rejected on error
						reject(error);
					});
				});
		});

		// promise resolved or rejected
		request_call.then((response) => {
			var obj = JSON.parse(response);
			// var txt = "The weather for " + obj.name + " has " + obj.weather[0].description + ".  The temperature is " + obj.main.temp +
			// 	" Celsius";
			console.log(response);
			res.send({
				replies: [{
					type: "text",
					content: response.response.summary.text
				}],
				conversation: {
					memory: {
						key: "value"
					}
				}
			});
		}).catch((error) => {
			console.log(error);
		});
	});
}
module.exports = loadHere;