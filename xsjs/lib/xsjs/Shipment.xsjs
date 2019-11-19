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
			'VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
		var resultSet = conn.executeUpdate(query, payload.soId, payload.vehicleId, payload.material, utils.getDate(payload.arrivalTimeAtOrigin),
			utils.getDate(payload.departureAtOrigin), utils.getDate(payload.arrivalTimeAtDestination), utils.getDate(payload.departureAtDestination),
			utils.getDate(payload.startLoading), utils.getDate(payload.endLoading),
			utils.getDate(payload.startUnloading), utils.getDate(payload.endUnloading), utils.getDate(payload.contactPhoneAtOrigin), payload.contactPersonAtOrigin,
			payload.contactPhoneAtDestination,
			payload.contactPersonAtDestination, payload.originAddressId, payload.destinationAddressId, payload.shipmentDate,payload.customerId, payload.cancelled);
		conn.commit();
		$.response.contentType = "application/json";
		$.response.setBody(JSON.stringify(resultSet));
	} catch (err) {
		$.response.contentType = "text/html";
		$.response.setBody("could not insert data " + err);
	}
	break;
case ($.net.http.GET):
	var customerId = $.request.parameters.get("customerId");
	try {
		var today = new Date();
		today.setHours(0,0,0);
		var conn = $.hdb.getConnection();
		var query =
			'SELECT "shipmentId" FROM "tables.Shipment" WHERE "customerId" = ? and ("cancelled" = false or "cancelled" is null) and "arrivalTimeAtDestination" is null and "shipmentDate" = ? ORDER BY "shipmentId" DESC';
		var resultSet = conn.executeQuery(query,customerId, today);
		var ids = "";
		for (i=0; i <= resultSet.length -1; i++){
			if (i===0){
				ids = resultSet[i].shipmentId
			}else{
				ids = ids + ", " + resultSet[i].shipmentId
			}
		}
		var res = {
				replies: [{
					type: 'text',
					content: "Your shipments Ids are: "+ids
				}]
			}
		$.response.contentType = "application/json";
		$.response.setBody(res);
	} catch (err) {
		$.response.contentType = "text/html";
		$.response.setBody("{\"error\": \"no data\"}");
	}
	break;
case ($.net.http.PUT):
		var payload = JSON.parse($.request.body.asString());
	try {
		var conn = $.hdb.getConnection();
		var query =
			'UPDATE "tables.Shipment" SET "cancelled" = true WHERE "shipmentId" = ?';
		var resultSet = conn.executeUpdate(query, payload.shipmentId);
		conn.commit();
		var text = "Shipment " + payload.shipmentId +  " was succesfully canceled."
			var res = {
				replies: [{
					type: 'text',
					content: text
				}]
			}
		$.response.contentType = "application/json";
		$.response.setBody(res);
	} catch (err) {
		$.response.contentType = "text/html";
		$.response.setBody("{\"error\": \"no data\"}");
	}
	break;
default:
	$.response.status = $.net.http.METHOD_NOT_ALLOWED;
	$.response.setBody("{\"error\": \"Method not allowed\"}");
	}