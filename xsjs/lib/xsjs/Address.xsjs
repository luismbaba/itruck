switch ($.request.method) {
case ($.net.http.GET):
	var addressId = $.request.parameters.get('addressId');
	try {
		var conn = $.hdb.getConnection();
		var query = 'SELECT * FROM "tables.Address" WHERE "addressId" = ' + addressId;
		var resultSet = conn.executeUpdate(query);
		$.response.contentType = "application/json";
		$.response.setBody(JSON.stringify(resultSet));
	} catch (err) {
		$.response.contentType = "text/html";
		$.response
			.setBody("No rows retrieved");
	}
	break;
case ($.net.http.POST):
	var payload = JSON.parse($.request.body.asString());
	try {
		var conn = $.hdb.getConnection();
		var query = 'INSERT INTO "tables.Address"("street", "number", "lat", "lon") VALUES (?,?,?,?)';
		var resultSet = conn.executeUpdate(query, payload.street, payload.number, payload.lat, payload.lon);
		conn.commit();
		$.response.contentType = "application/json";
		$.response.setBody(JSON.stringify(resultSet));
	} catch (err) {
		$.response.contentType = "text/html";
		$.response
			.setBody("could not insert data");
	}
	break;
default:
	$.response.status = $.net.http.METHOD_NOT_ALLOWED;
	$.response
		.setBody("Method not allowed");
}