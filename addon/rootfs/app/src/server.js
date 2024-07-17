import express from 'express';
import path from 'path';

import getConfig from "./config.js";
import {
  getSensorReadings,
  createConsumptionRecording,
  getEntities,
  storeRecording,
  removeRecording,
  loadRecording,
  loadAllRecordings
} from './consumption.js';
import {
  getSolarForecast,
  validateSolarInfo
} from './forecast.js';
import { getPredictions } from './prediction.js';

const config = await getConfig();
const app = express();

console.log(`Supervisor Token: ${config.haToken}`);
console.log(`Serving static content from ${path.join(process.cwd(), 'static')}`);

// Middleware that serves static files of the UI application
app.use('/', express.static(path.join(process.cwd(), 'static')));

// Parse HTTP request body as JSON
app.use(express.json());

app.get("/api/entities", async (req, res) => {
  res.send(await getEntities());
});

app.get("/api/recordings", async (req, res, next) => {
  try {
    if (req.query.id) {
      // load and return a single recording
      const recording = await loadRecording(req.query.id);
      if (recording) {
        res.status(200).send(recording);
      }
      else {
        res.status(404).send({ message: `recording with ID ${req.query.id} not found` });
      }
    } else {
      // load and return all recordings
      res.status(200).send(await loadAllRecordings());
    }
  } catch (error) {
    next(error);
  }
});

app.post("/api/recordings", async (req, res, next) => {
  try {
    const d = req.body;
    const sensorReadings = await getSensorReadings(d.entityId, d.begin, d.end);
    if (!sensorReadings || sensorReadings.readings.length === 0) {
      res.status(400).send({ message: `cannot find sensor readings for entity ${d.entity} between ${d.begin} and ${d.end}` });
      return;
    }
    const recording = createConsumptionRecording(sensorReadings, d.name, d.intervalLength);
    await storeRecording(recording);
    res.status(201).send(recording);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/recordings/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const rec = await loadRecording(id);
    if (rec) {
      await removeRecording(id);
      res.status(200).send({ message: `recording ${id} deleted` });
    } else {
      res.status(404).send({ message: `recording ${id} not found` });
    }
  } catch (error) {
    next(error);
  }
});

app.get("/api/predictions/:id", async (req, res, next) => {
  try {
    const rec = await loadRecording(req.params.id);
    if (!rec) {
      res.status(404).send({ message: `recording ${id} not found` });
      return;
    }
    const forecast = await getSolarForecast(config.solarInfo);
    if (!forecast) {
      res.status(400).send({ message: `cannot get solar forecast for ${config.solarInfo.latitude}/${config.solarInfo.longitude}` });
      return;
    }
    res.status(200).send(getPredictions(rec, forecast, req.query.span, req.query.upto));
  } catch (error) {
    next(error);
  }
});

app.get("/api/solarinfo", async (req, res, next) => {
  try {
    res.status(200).send(await validateSolarInfo(config.solarInfo));
  } catch (error) {
    res.status(500).send({ message: "Solar information is invalid" });
  }
});

app.get("/api/solarforecast", async (req, res, next) => {
  try {
    res.status(200).send(await getSolarForecast(config.solarInfo));
  } catch (error) {
    res.status(500).send({ message: "could not get solar forecast information" });
  }
});

app.get("/api/readings/:entityId/:begin/:end", async (req, res, next) => {
  try {
    if (!req.params.entityId || !req.params.begin || !req.params.end) {
      res.status(400).send({ message: "Cannot get sensor readings due to invalid URL parameters" });
    } else {
      res.status(200).send(await getSensorReadings(req.params.entityId, req.params.begin, req.params.end));
    }
  } catch (error) {
    res.status(500).send({ message: "Solar information is invalid" });
  }
});

// Startup request processing
app.listen(config.port, () => {
  console.log(`Socopt Addon listening on port ${config.port}`)
});