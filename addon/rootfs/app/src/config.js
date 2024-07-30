import fs from 'node:fs/promises';

// Home assistant stores addon configurations / options in this file. They can be edited by accessing the addon settings within home assistant.
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
    if (!isHAEnvironment()) return getLocalConfig();
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
/**
 * Returns true if the addon is currently executed within the home assistant environment.
 * @returns boolean
 */
function isHAEnvironment() {
    const spvToken = process.env.SUPERVISOR_TOKEN;
    return spvToken !== undefined;
}

/**
 * Rerturns an object with configuration data for local testing and remote API access to the home assistant installation.
 */
function getLocalConfig() {
    const apiURL = process.env.haUrl;
    const apiToken = process.env.haToken;
    const addonPort = process.env.addonPort;
    if (!apiURL || !addonPort || !apiToken) {
        throw { message: "cannot determine home assistant API details for local testing, check .env file" }
    }
    return {
        port: addonPort,
        haURL: apiURL,
        haToken: apiToken,
        solarInfo: {
            latitude: 51.27,
            longitude: 9.54,
            declination: 50,
            azimut: 45,
            maxPower: 3.5
        }
    }
}