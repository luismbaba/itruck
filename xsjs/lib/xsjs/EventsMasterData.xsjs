switch ($.request.method) {
case ($.net.http.POST):
	var payload = JSON.parse($.request.body.asString());
	try {
		var conn = $.hdb.getConnection();
		var query = 'INSERT INTO "tables.EventMasterData"("description", "eventType", "avgEventTime") VALUES (?,?,?)';
		var resultSet = conn.executeUpdate(query, payload.description, payload.eventType, payload.avgEventTime);
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