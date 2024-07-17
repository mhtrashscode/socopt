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
                predictions: []
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
            m.setProperty("/predictions", await Service.getPredictions(id));
        }
    });
});
