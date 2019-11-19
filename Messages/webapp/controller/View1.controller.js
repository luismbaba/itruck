sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, MessageBox) {
	"use strict";

	return Controller.extend("com.itruck.Messages.controller.View1", {
		onInit: function () {

			var data = {
				message: ""
			};
			var oModel = new JSONModel(data);
			this.getView().setModel(oModel, "data");
			
		},
		onSubmit: function (data) {
			var oModel = this.getView().getModel("data");
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			if (oModel.getProperty("/message") === null || oModel.getProperty("/message") === "") {
				MessageBox.alert(
							"Please enter your message", {
								styleClass: bCompact ? "sapUiSizeCompact" : ""
							}
						);
			} else {
				$.ajax({
					url: "https://zjlfurbmpirnwnw0-itruck-xsjs.cfapps.eu10.hana.ondemand.com/xsjs/Messages.xsjs",
					crossDomain: true,
					type: "POST",
					dataType: "json",
					contentType: "application/json",
					data: oModel.getJSON(),
					processData: false,
					success: function (oResponse) {
						oModel.setProperty("/message", "");
					MessageBox.success(
							"Message successfully sent!", {
								styleClass: bCompact ? "sapUiSizeCompact" : ""
							}
						);
					},
					error: function (err) {
						MessageBox.error(
							"Server Errror", {
								styleClass: bCompact ? "sapUiSizeCompact" : ""
							}
						);
					}
				});
			}

		}

	});
});