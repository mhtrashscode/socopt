sap.ui.define([
	"./BaseController",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"de/fernunihagen/smartgrids/socopt/lib/Service"
], function (BaseController, MessageBox, JSONModel, Service) {
	"use strict";

	return BaseController.extend("de.fernunihagen.smartgrids.socopt.controller.Main", {

		onInit: function () {
			// setup local model and initiate data load
			const model = new JSONModel({
				entities: [],
				solarInfo: undefined,
				solarForecast: undefined,
				recordings: [],
				newRecording: {
					entityId: undefined,
					name: undefined,
					begin: undefined,
					end: undefined,
					intervalLength: 5
				},
				sensorReadings: {},
				readingChartVisible: false,
				recListMode: "None",
			});
			const view = this.getView();
			view.setModel(model, "viewData");
			this.loadSolarInfo();
			this.loadSolarForecast();
			this.loadEntities();
			this.loadRecordings();
			// handle routing
			this.getRouter().attachRoutePatternMatched(this.navRouteMatched, this);
		},

		navRouteMatched: function (event) {
			const view = this.getView();
			const tabBar = view.byId("icontabbar");
			const routeName = event.getParameters().name;
			switch (routeName) {
				case 'default':
				case 'solarInfo':
					tabBar.setSelectedKey("solarInfo");
					console.log(`showing solar information`);
					break;					
				case 'recordings':
					tabBar.setSelectedKey("recordings");
					console.log(`showing recordings`);
					break;
			}
		},

		loadEntities: async function () {
			const entities = await Service.getEntities();
			const model = this.getModel("viewData");
			model.setProperty("/entities", entities);
		},

		loadRecordings: async function () {
			const recs = await Service.getRecordings();
			const model = this.getModel("viewData");
			model.setProperty("/recordings", recs);
		},

		loadSensorReadings: async function (entityId, begin, end) {
			const model = this.getModel("viewData");

			if (entityId && begin && end) {
				const readings = await Service.getSensorReadings(entityId, begin, end);
				model.setProperty("/sensorReadings", readings);
			}
		},

		loadSolarInfo: async function () {
			const info = await Service.getSolarInfo();
			const model = this.getModel("viewData");
			model.setProperty("/solarInfo", info);
		},

		loadSolarForecast: async function () {
			const forecast = await Service.getSolarForecast();
			const model = this.getModel("viewData");
			model.setProperty("/solarForecast", forecast);
		},

		deleteRecording: async function (id) {
			try {
				await Service.deleteRecording(id);
				this.loadRecordings();
			} catch (error) {
				MessageBox.error(error.message);
			}
		},

		recordingPress: function (id) {
			this.navTo("recording", {
				id: id
			});
		},

		addRecordingPress: async function () {
			if (!this.dialog) {
				const view = this.getView();
				const dialog = await this.loadFragment({
					name: "de.fernunihagen.smartgrids.socopt.fragments.RecordingDialog"
				});
				view.addDependent(dialog);
				this.dialog = dialog;
			}
			this.dialog.open();
		},

		saveRecordingPress: async function () {
			const model = this.getModel("viewData");
			const rec = model.getProperty("/newRecording");
			console.log(rec);

			try {
				await Service.postRecording(rec);
				this.loadRecordings();
				this.dialog.close();
			} catch (error) {
				MessageBox.error(error.message);
			}
		},

		cancelRecordingPress: function () {
			this.dialog.close();
		},

		recordingDateChange: async function () {
			const model = this.getModel("viewData");
			const entityId = model.getProperty("/newRecording/entityId");
			const begin = model.getProperty("/newRecording/begin");
			const end = model.getProperty("/newRecording/end");
			if (entityId && begin && end) {
				await this.loadSensorReadings(entityId, begin, end);
				model.setProperty("/readingChartVisible", true);
			} else {
				model.setProperty("/readingChartVisible", false);
			}
		},

		toggleRecordingDelete: function () {
			const model = this.getModel("viewData");
			let listMode = model.getProperty("/recListMode");
			if (listMode === "None") listMode = 'Delete';
			else listMode = 'None';
			model.setProperty("/recListMode", listMode);
		},

		recDeletePress: function (event) {
			const item = event.getParameter("listItem");
			const c = item.getBindingContext("viewData");
			const rec = c.getModel().getProperty(c.getPath());
			this.deleteRecording(rec.id);
		}
	});
});
