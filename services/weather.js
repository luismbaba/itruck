const http = require('http');
const https = require('https');

function loadWeather(app) {

	app.get('/weather', (req, res) => {
		var city = req.query.city;
		console.log(city);
		if (city === undefined) {
			throw new Error("BROKEN");
		}

		// define the promise
		let request_call = new Promise((resolve, reject) => {
			http.get('http://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=afd0cd8974e21abbc2807cb42baefde3&units=metric', (response) => {
				let chunks_of_data = [];

				response.on('data', (fragments) => {
					chunks_of_data.push(fragments);
				});

				response.on('end', () => {
					let response_body = Buffer.concat(chunks_of_data);

					// promise resolved on success
					resolve(response_body.toString());
				});

				response.on('error', (error) => {
					// promise rejected on error
					reject(error);
				});
			});
		});

		// promise resolved or rejected
		request_call.then((response) => {
			var obj = JSON.parse(response);
			var txt = "The weather for " + obj.name +  " has " + obj.weather[0].description + ".  The temperature is " + obj.main.temp + " Celsius";
			console.log(response);
			res.send({
				replies: [{
					type: 'text',
					content: txt
				}],
				conversation: {
					memory: {
						key: 'value'
					}
				}
			});
		}).catch((error) => {
			console.log(error);
		});
	});
}

module.exports = loadWeather;