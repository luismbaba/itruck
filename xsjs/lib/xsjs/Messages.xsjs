var utils = $.import("xsjs", "Utils");

switch ($.request.method) {
case ($.net.http.POST):
	var payload = JSON.parse($.request.body.asString());
	try {
		var conn = $.hdb.getConnection();
		var shipmentDate = new Date();
		shipmentDate.setHours(0, 0, 0);
		var query = 'SELECT "vehicleId" FROM "tables.Shipment" WHERE "shipmentDate" = ?';
		vehicleIds = conn.executeQuery(query, shipmentDate);
		var result = vehicleIds.forEach(function (element) {
			console.log(element.vehicleId);
			query =
				'INSERT INTO "tables.Messages"("message", "vehicleId", "read", "creationDate") VALUES (?,?,?,?)';
			var result =  conn.executeUpdate(query, payload.message, element.vehicleId, false, new Date());
			conn.commit();
			return result;
		});
		conn.commit();

		$.response.contentType = "application/json";
		$.response.setBody(JSON.stringify(result));
	} catch (err) {
		$.response.contentType = "text/html";
		$.response
			.setBody("could not insert data");
	}
	break;
case ($.net.http.GET):
	var vehicleId = $.request.parameters.get("vehicleId");
	try {
		var conn = $.hdb.getConnection();
		var query = 'SELECT TOP 1 "id", "message" FROM "tables.Messages" WHERE "vehicleId" = ? and "read" = FALSE ORDER BY "id" DESC';
		var resultSet = conn.executeQuery(query, vehicleId);
		if (resultSet.length !== 0) {
			var updateQuery = 'UPDATE "tables.Messages" SET "read" = TRUE WHERE "id" = ? ';
			var updateResult = conn.executeUpdate(updateQuery, resultSet[0].id);
			conn.commit();
		}
		$.response.contentType = "application/json";
		$.response.setBody(JSON.stringify(resultSet));
	} catch (err) {
		$.response.contentType = "text/html";
		$.response
			.setBody("no data");
	}
	break;
default:
	$.response.status = $.net.http.METHOD_NOT_ALLOWED;
	$.response
		.setBody("Method not allowed");
}