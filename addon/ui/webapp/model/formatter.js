sap.ui.define(function () {
	"use strict";

	const timeShort = new Intl.DateTimeFormat("de-DE", {
		timeStyle: "short"
	});
	const timeLong = new Intl.DateTimeFormat("de-DE", {
		timeStyle: "medium"
	});
	const weekday = new Intl.DateTimeFormat("en-US", {
		weekday: "short"
	});
	const datef = new Intl.DateTimeFormat("de-DE", {
		dateStyle: "medium"
	});

	return {
		w2kw: function (value) {
			const kw = value / 1000;
			return Math.round(kw * 100) / 100;
		},
		percentage: function (value) {
			return value * 100;
		},
		formatDate: function (sDate) {
			if (sDate) {
				const d = new Date(sDate);
				return `${datef.format(d)} ${timeLong.format(d)}`;
			}
		},
		weekTime: function (sDate) {
			const d = new Date(sDate);
			return `${weekday.format(d)} ${timeShort.format(d)}`;
		},
		coverage: function (coverage) {
			const c = Number.parseFloat(coverage);
			if (c >= 0.75) return 'Success';
			if (c >= 0.50) return 'Warning';
			return 'Error';
		}
	};
});
