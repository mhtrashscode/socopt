/*
    Renders a bubble chart for sensor reading data stored in control property "sensorReadings".
*/
sap.ui.define([
    "sap/ui/core/Control"
], function (Control) {
    "use strict";

    return Control.extend("de.fernunihagen.smartgrids.socopt.controls.ReadingsBubbleChart", {

        metadata: {
            properties: {
                /*
                    Expects an object in format
                    {
                        entityId: <string>,
                        begin: <timestamp>,
                        end: <timestamp>,
                        readings: [
                            { timestamp: <timestamp>, state: <int; power in watts> }
                            ...
                        ]
                    }
                */
                sensorReadings: { type: "object" }
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

            const readings = this.getSensorReadings();

            const chartData = readings.readings.map(r => {
                return {
                    x: r.timestamp,
                    y: r.state,
                    r: 4
                };
            });

            // render the chart
            this._chart = new Chart.Chart(this.getDomRef(), {
                type: 'bubble',
                data: {
                    datasets: [{
                        label: `Sensor Readings ${readings.entityId}`,
                        data: chartData,
                        backgroundColor: 'rgb(255, 0, 0)'
                    }]
                },
                options: {
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
                            min: readings.begin,
                            max: readings.end,
                            ticks: {
                                maxTicksLimit: 10
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
                //oRm.style("margin", "5em");
                oRm.openEnd();
                oRm.close("canvas");
            }
        }
    });
});