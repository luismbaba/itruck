switch ($.request.method) {
case ($.net.http.POST):
	var payload = JSON.parse($.request.body.asString());
	try {
		var conn = $.hdb.getConnection();
		var query = 'INSERT INTO "tables.Locations"("vehicleId.vehicleId", "speed", "lat", "lon","alt","creationDate") VALUES (?,?,?,?,?,?)';
		var resultSet = conn.executeUpdate(query, payload.vehicleId, payload.speed, payload.lat, payload.lon,payload.alt, new Date());
		conn.commit();
		$.response.contentType = "application/json";
		$.response.setBody(JSON.stringify(resultSet));
	} catch (err) {
		$.response.contentType = "text/html";
		$.response
			.setBody("could not insert data "+ err);
	}
	break;
default:
	$.response.status = $.net.http.METHOD_NOT_ALLOWED;
	$.response
		.setBody("Method not allowed");
}