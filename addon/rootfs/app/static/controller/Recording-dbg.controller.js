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
                recording: {},
                predictions: [],
                slectedPrediction: undefined
            });
            const view = this.getView();
            view.setModel(model, "viewData");
            // handle routing
            this.getRouter().attachRoutePatternMatched(this.navRouteMatched, this);
        },

        navRouteMatched: async function (event) {
            const routeName = event.getParameters().name;
            if (routeName !== "recording") return;
            const id = event.getParameters().arguments.id;
            const m = this.getModel("viewData");
            m.setProperty("/recording", await Service.getRecording(id));
            const predictions = await Service.getPredictions(id);
            if (predictions.length > 0) {
                m.setProperty("/predictions", predictions);
                m.setProperty("/slectedPrediction", predictions[0]);
                //const table = this.byId("predictionsTable");
            }
        },

        predictionSelectionChange: function (event) {
            const table = event.getSource();
            const item = table.getSelectedItem();
            const context = item.getBindingContext("viewData");
            const model = context.getModel();
            const predictionItem = model.getProperty(context.getPath());
            console.log(predictionItem);
            model.setProperty("/slectedPrediction", predictionItem);
        },

        tableUpdateFinished: function (event) {
            // auto-selct first item of the list
            const table = event.getSource();
            const items = table.getItems();
            if (items && items.length > 0) {
                table.setSelectedItem(items[0]);
            }
        }
    });
});
