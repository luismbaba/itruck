const express = require('express');
const bodyParser = require('body-parser')
const loadWeather = require('./weather.js');
const loadHere = require('./here.js');
const loadLocation = require('./location.js');
const publicIp = require('public-ip');

const app = express();

//Para receber o body no request
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

// Para poder fazer chamado do navegador
app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "http://localhost:4200"); // update to match the domain you will make the request from
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

loadWeather(app);
loadHere(app);
loadLocation(app);

app.get('/', function (req, res) {
	res.send('Hello World!');
	console.log('Hello World sent to Browser at: ' + new Date()); //new line
});

app.get('/ip', function (req, res) {
	(async() => {
		var ip = await publicIp.v4();
		res.send('IP:' + ip);
	})();
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
	console.log('myapp is using Node.js version: ' + process.version); //new line
	console.log('myapp listening on port ' + port);
});