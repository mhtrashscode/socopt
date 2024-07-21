/*
    This module provides convenience functions to access the SOCOPT addon web API.
*/
sap.ui.define([
    "sap/base/Log"
], function (Log) {
    "use strict";

    return {
        getEntities: async function () {
            const response = await fetch("api/entities", {
                method: "GET"
            });
            if (!response.ok) {
                throw new Error(response.message);
            }
            return await response.json();
        },

        getRecordings: async function () {
            const response = await fetch("api/recordings", {
                method: "GET"
            });
            if (!response.ok) {
                throw new Error(response.message);
            }
            return await response.json();
        },

        getRecording: async function (id) {
            const response = await fetch(`api/recordings?id=${id}`, {
                method: "GET"
            });
            if (!response.ok) {
                throw new Error(response.message);
            }
            return await response.json();
        },

        postRecording: async function (recording) {
            const payload = JSON.stringify({
                name: recording.name,
                entityId: recording.entityId,
                begin: recording.begin,
                end: recording.end,
                intervalLength: recording.intervalLength
            });
            const response = await fetch(`api/recordings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: payload
            });
            if (!response.ok) {
                throw new Error(response.message);
            }
        },

        deleteRecording: async function (id) {
            const response = await fetch(`api/recordings/${id}`, {
                method: "DELETE"
            });
            if (!response.ok) {
                throw new Error(response.message);
            }
            return await response.json();
        },

        getPredictions: async function (recordingId, span = 120, upto = 10) {
            const p = { span: span, upto: upto };
            if (!p.span) delete p.span;
            if (!p.upto) delete p.upto;
            const up = new URLSearchParams(p);
            let url = `api/predictions/${recordingId}`;
            if (up.size > 0) url = `${url}?${up.toString()}`;
            const response = await fetch(url, {
                method: "GET"
            });
            if (!response.ok) {
                throw new Error(response.message);
            }
            return await response.json();
        },

        getSolarInfo: async function () {
            const response = await fetch(`api/solarinfo`, {
                method: "GET"
            });
            if (!response.ok) {
                throw new Error(response.message);
            }
            return await response.json();
        },

        getSolarForecast: async function () {
            const response = await fetch(`api/solarforecast`, {
                method: "GET"
            });
            if (!response.ok) {
                throw new Error(response.message);
            }
            return await response.json();
        },

        getSensorReadings: async function (entityId, begin, end) {
            const response = await fetch(`api/readings/${entityId}/${begin}/${end}`, {
                method: "GET"
            });
            if (!response.ok) {
                throw new Error(response.message);
            }
            const result = await response.json();
            result.begin = begin;
            result.end = end;
            return result;
        }
    }
});
