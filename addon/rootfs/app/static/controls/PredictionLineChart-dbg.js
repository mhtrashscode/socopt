/*
    Renders a solar power coverage prediction as a line chart showing both the expected solar
    procution and energy consumption.
*/
sap.ui.define([
    "sap/ui/core/Control"
], function (Control) {
    "use strict";

    return Control.extend("de.fernunihagen.smartgrids.socopt.controls.PredictionLineChart", {
        metadata: {
            properties: {
                /*
                    Expects an object in format
                    {
                        intervals: [
                            {
                                begin: <timestamp>,
                                end: <timestamp>,
                                powerAvailable: <int; power in watts>
                                powerRequired: <int; power in watts>
                            }
                            ...
                        ]
                    }
                */
                prediction: { type: "object" }
            }
        },

        exit: function () {
            if (this._chart) {
                this._chart.destroy();
            }
        },

        onBeforeRendering: function () {
            if (this._chart) {
                this._chart.destroy();
            }
        },

        onAfterRendering: function () {
            if (!this.getVisible()) return;

            // create prduction dataset
            const prediction = this.getPrediction();
            const prodSet = {
                label: `Solar Production`,
                data: prediction.intervals.map(i => {
                    return {
                        x: i.begin,
                        y: i.powerAvailable
                    };
                }),
                backgroundColor: 'rgb(24, 137, 24)',
                borderColor: 'rgb(24, 137, 24)',
                tension: 0.1
            }
            // create consumption dataset
            const conSet = {
                label: `Consumption`,
                data: prediction.intervals.map(i => {
                    return {
                        x: i.begin,
                        y: i.powerRequired
                    };
                }),
                backgroundColor: 'rgb(170,8,8)',
                borderColor: 'rgb(170,8,8)',
                tension: 0.1
            }

            // render the chart
            this._chart = new Chart.Chart(this.getDomRef(), {
                type: 'line',
                data: {
                    datasets: [prodSet, conSet]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                text: 'Watts',
                                display: true
                            }
                        },
                        x: {
                            type: 'time',
                            bounds: 'ticks',
                            autoSkip: 'true',
                            ticks: {
                                maxTicksLimit: 20
                            },
                        }
                    }
                }
            });
        },

        renderer: {
            apiVersion: 2,
            render: function (oRm, oControl) {
                oRm.openStart("canvas", oControl);
                oRm.style("max-height", "20em");
                oRm.openEnd();
                oRm.close("canvas");
            }
        }
    });
});