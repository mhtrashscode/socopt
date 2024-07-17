sap.ui.define([
    "sap/ui/core/Control"
], function (Control) {
    "use strict";

    return Control.extend("de.fernunihagen.smartgrids.socopt.controls.ForecastLineChart", {

        metadata: {
            properties: {
                production: { type: "object" }
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
            const production = this.getProduction();
            const prodSet = {
                label: `Solar Production Forecast from ${new Date(production.info.time).toLocaleDateString('de-DE')}`,
                data: production.intervals.map(i => {
                    return {
                        x: i.timestamp,
                        y: i.power
                    };
                }),
                backgroundColor: 'rgb(24, 137, 24)',
                borderColor: 'rgb(24, 137, 24)',
                tension: 0.2
            }

            // render the chart
            this._chart = new Chart.Chart(this.getDomRef(), {
                type: 'line',
                data: {
                    datasets: [prodSet]
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
                            min: production.info.begin,
                            max: production.info.end,
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
                oRm.style("max-height", "25em");
                oRm.openEnd();
                oRm.close("canvas");
            }
        }

    });

});