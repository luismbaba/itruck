var utils = $.import("xsjs", "Utils");

switch ($.request.method) {
case ($.net.http.POST):
	var payload = JSON.parse($.request.body.asString());
	try {
		var conn = $.hdb.getConnection();
		if (utils.getDate(payload.shipmentDate) === null) {
			payload.shipmentDate = new Date();
			payload.shipmentDate.setHours(0, 0, 0);
		} else {
			payload.shipmentDate = utils.getDate(payload.shipmentDate);
			payload.shipmentDate.setHours(0, 0, 0);
		}
		var query =
			'INSERT INTO "tables.Shipment"( "soId", "vehicleId", "material","arrivalTimeAtOrigin","departureAtOrigin","arrivalTimeAtDestination","departureAtDestination","startLoading","endLoading","startUnloading","endUnloading","contactPhoneAtOrigin","contactPersonAtOrigin","contactPhoneAtDestination","contactPersonAtDestination","originAddress.addressId","destinationAddress.addressId", "shipmentDate", "customerId","cancelled")' +
			'VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?.?,?)';
		var resultSet = conn.executeUpdate(query, payload.soId, payload.vehicleId, payload.material, utils.getDate(payload.arrivalTimeAtOrigin),
			utils.getDate(payload.departureAtOrigin), utils.getDate(payload.arrivalTimeAtDestination), utils.getDate(payload.departureAtDestination),
			utils.getDate(payload.startLoading), utils.getDate(payload.endLoading),
			utils.getDate(payload.startUnloading), utils.getDate(payload.endUnloading), utils.getDate(payload.contactPhoneAtOrigin), payload.contactPersonAtOrigin,
			payload.contactPhoneAtDestination,
			payload.contactPersonAtDestination, payload.originAddressId, payload.destinationAddressId, payload.shipmentDate);
		conn.commit();
		$.response.contentType = "application/json";
		$.response.setBody(JSON.stringify(resultSet));
	} catch (err) {
		$.response.contentType = "text/html";
		$.response
			.setBody("could not insert data " + err);
	}
	break;
case ($.net.http.GET):
	var customerId = $.request.parameters.get("customerId");
	try {
		var conn = $.hdb.getConnection();
		var query = 'SELECT "shipmentId" FROM "tables.Shipment" WHERE "customerId" = ? and ("cancelled" = FALSE or "cancelled" = null ORDER BY "id" DESC';
		var resultSet = conn.executeQuery(query, customerId);
		$.response.contentType = "application/json";
		$.response.setBody(JSON.stringify(resultSet));
	} catch (err) {
		$.response.contentType = "text/html";
		$.response
			.setBody("{\"error\": \"no data\"}");
			}
		break;
		default:
		$.response.status = $.net.http.METHOD_NOT_ALLOWED;
		$.response
			.setBody("Method not allowed");
	}