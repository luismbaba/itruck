var utils = $.import("xsjs", "Utils");

switch ($.request.method) {
case ($.net.http.POST):
	var payload = JSON.parse($.request.body.asString());
	try {
		var conn = $.hdb.getConnection();
		// var selectQuery = 'SELECT TOP 1 E."id",EMD."plannedEvent" FROM "tables.Events" AS E RIGHT OUTER JOIN "tables.EventsMasterData" AS EMD ON E."eventId.id" = EMD."id" WHERE "eventId.id" = ? and "vehicleId.vehicleId" = ? and "eventEndTimestamp" IS NULL ORDER BY "id" DESC';
		var query = 'SELECT "plannedEvent" FROM "tables.EventMasterData" WHERE "id" = ?';
		var plannedEvent = conn.executeQuery(query, payload.eventType);
		if (plannedEvent.length === 0) {
			$.response.status = $.net.http.UNPROCESSABLE_ENTITY;
			$.response
				.setBody("Unknown Event Type");
		} else {
			shipmentDate = new Date(payload.date);
			shipmentDate.setHours(0, 0, 0);
			var selectShipmentQuery =
				'SELECT TOP 1 "shipmentId" FROM "tables.Shipment" WHERE "vehicleId" = ? and "shipmentDate" = ? ORDER BY "shipmentId" DESC';
			var shipmentId = conn.executeQuery(selectShipmentQuery, payload.vehicleId, shipmentDate);
			if (plannedEvent[0].plannedEvent) {
				var query =
					'INSERT INTO "tables.Events"("eventId.id", "eventStartTimestamp", "eventEndTimestamp", "shipmentId.shipmentId","vehicleId.vehicleId") VALUES (?,?,?,?,?)';
				resultSet = conn.executeUpdate(query, payload.eventType, utils.getDate(payload.date), utils.getDate(payload.date), shipmentId[0].shipmentId,
					payload.vehicleId);
				conn.commit();
			} else {
				var query =
					'INSERT INTO "tables.Events"("eventId.id", "eventStartTimestamp",  "shipmentId.shipmentId","vehicleId.vehicleId") VALUES (?,?,?,?)';
				resultSet = conn.executeUpdate(query, payload.eventType, utils.getDate(payload.date), shipmentId[0].shipmentId, payload.vehicleId);
				conn.commit();
			}
		}
		$.response.contentType = "application/json";
		$.response.setBody(JSON.stringify(resultSet));
	} catch (err) {
		$.response.contentType = "text/html";
		$.response
			.setBody("could not insert data");
	}
	break;
case ($.net.http.PUT):
	var payload = JSON.parse($.request.body.asString());
	try {
		var conn = $.hdb.getConnection();
		// var selectQuery = 'SELECT TOP 1 E."id",EMD."plannedEvent" FROM "tables.Events" AS E RIGHT OUTER JOIN "tables.EventsMasterData" AS EMD ON E."eventId.id" = EMD."id" WHERE "eventId.id" = ? and "vehicleId.vehicleId" = ? and "eventEndTimestamp" IS NULL ORDER BY "id" DESC';
		var query = 'SELECT "id" FROM "tables.Events" WHERE "vehicleId.vehicleId" = ? and "eventEndTimestamp" IS NULL ORDER BY "id" DESC';
		var openEvents = conn.executeQuery(query, payload.vehicleId);

		openEvents.forEach(function (element) {
			console.log(element.id);
				var updateQuery = 'UPDATE "tables.Events" SET "eventEndTimestamp" = ? WHERE "id" = ?';
				var openEvents = conn.executeUpdate(updateQuery, payload.date, element.id);
				conn.commit();
		});

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

function closeOpenEvents() {}