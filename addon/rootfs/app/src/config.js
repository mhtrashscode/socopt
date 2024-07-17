import fs from 'node:fs/promises';

const local = {
    port: 3001,
    haURL: "http://127.0.0.1:8122/api",
    haToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIwMDgzZjNhYjNkMGM0YTgwOGJmMTEzMTRjNGQ0MjUwOCIsImlhdCI6MTcyMDQyODc0MCwiZXhwIjoyMDM1Nzg4NzQwfQ.uvuR1yOlRJSxDcsszMMvXA4iLGSJiMPZ3cIHoRPOSuo",
    solarInfo: {
        latitude: 51.27,
        longitude: 9.54,
        declination: 50,
        azimut: 45,
        maxPower: 3.5
    }
}
const optionsPath = "/data/options.json";

let configCache = undefined;

export default async function getConfig() {
    if (!configCache) {
        configCache = await readConfig();
    }
    return configCache;
}

async function readConfig() {
    const spvToken = process.env.SUPERVISOR_TOKEN;
    // return default config for local development testing
    if (!spvToken) return local;
    // return home assistant addon configuration
    try {
        const file = await fs.readFile(optionsPath, { encoding: 'utf8' });
        const options = JSON.parse(file);
        return {
            port: 3000,
            haURL: "http://supervisor/core/api",
            haToken: process.env.SUPERVISOR_TOKEN,
            solarInfo: {
                latitude: options.latitude,
                longitude: options.longitude,
                declination: options.declination,
                azimut: options.azimut,
                maxPower: options.kilowattpower
            }
        };
    } catch (err) {
        console.error(err);
        throw err;
    }
}