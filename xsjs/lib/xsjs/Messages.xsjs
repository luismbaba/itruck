var utils = $.import("xsjs", "Utils");

$.response.headers.set("Access-Control-Allow-Origin", "*");
$.response.headers.set("Access-Control-Allow-Methods", "*");
$.response.headers.set("Access-Control-Allow-Headers", "*");
$.response.status = $.net.http.OK;

switch ($.request.method) {
case ($.net.http.OPTIONS):
	$.response.headers.set("Access-Control-Allow-Origin", "*");
	$.response.headers.set("Access-Control-Allow-Methods", "*");
	$.response.headers.set("Access-Control-Allow-Headers", "*");
	$.response.status = $.net.http.OK;
	break;
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
			var result = conn.executeUpdate(query, payload.message, element.vehicleId, false, new Date());
			conn.commit();
			return result;
		});
		conn.commit();

		$.response.contentType = "application/json";
		$.response.setBody("{\"message\": \"message sent\"}");
	} catch (err) {
		$.response.contentType = "text/html";
		$.response
			.setBody({\"error\": \"could not insert data\"}");
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
			.setBody({\"error\": \"no data\"}");
	}
	break;
default:
	$.response.status = $.net.http.METHOD_NOT_ALLOWED;
	$.response
		.setBody({\"error\": \"Method not allowed\"});
}