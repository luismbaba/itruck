"use strict";

$.import("xsjs", "session");
var SESSIONINFO = $.xsjs.session;
/**
@param {connection} Connection - The SQL connection used in the OData request
@param {beforeTableName} String - The name of a temporary table with the single entry before the operation (UPDATE and DELETE events only)
@param {afterTableName} String -The name of a temporary table with the single entry after the operation (CREATE and UPDATE events only)
*/
function createTest(param) {
try{
	var conn = $.db.getConnection();
	var after = param.afterTableName;

	var pStmt = param.connection.prepareStatement("select * from \"" + after + "\"");
	var Payload = SESSIONINFO.recordSetToJSON(pStmt.executeQuery(), "Body");

	pStmt = conn.prepareStatement('INSERT INTO "tables.Address" Values(?,?,?,?)');

	pStmt.setString(1, Payload.Body[0].street.toString());
	pStmt.setString(2, Payload.Body[0].number.toString());
	pStmt.setDouble(3, parseFloat(Payload.Body[0].lat));
	pStmt.setDouble(4, parseFloat(Payload.Body[0].lon));

	var result = pStmt.executeUpdate();
	conn.commit();
	conn.close();
	console.log(result);
	console.log('success');
	return{ 
   HTTP_STATUS_CODE: 200, // e.g. 400, 500, etc. 
   BODY: "test"

}; 
}catch(err){
	console.log(err);
	
}

}