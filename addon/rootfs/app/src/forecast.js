import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);
import fs from 'node:fs/promises';

const forecastCacheFilename = "../data/forecast-cache.json";

/**
 * Validates the given solar plane information using the solar forecast web service. Returns detailed information about the solar plane
 * or throws an error in case plane data is invalid.
 * @param {Object} solarInfo Object containing latitude, longitude, declination, azimut and maximum Power (KW) of the solar panel intallation.
 * @returns 
 */
export async function validateSolarInfo(solarInfo) {
    const url = `https://api.forecast.solar/check/${solarInfo.latitude}/${solarInfo.longitude}/${solarInfo.declination}/${solarInfo.azimut}/${solarInfo.maxPower}`;
    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json"
        }
    });
    console.log(url, response.status);
    if (response.status >= 300) {
        throw { message: `cannot validate solar plane information; status code ${response.status}` };
    }
    const result = (await response.json());
    return result.result;
}

/**
 * Returns the solar forecast for the given solar panel installation.
 * @param {Object} solarInfo Object containing latitude, longitude, declination, azimut and maximum Power (KW) of the solar panel intallation.
 * @returns 
 */
export async function getSolarForecast(solarInfo) {
    // read forecast cache file + check if there´s any content and if the content is valid / up to date
    const cachedForecast = await getCachedForecast();
    let cacheValid = !isObjectEmpty(cachedForecast);
    if (cacheValid) {
        // check if forecast data refers to a date in the past
        cacheValid = !dayjs(cachedForecast.info.begin).isBefore(dayjs(), 'day');
    }
    if (cacheValid) {
        // cache is availbale and valid -> return cached forecast
        console.info("returning forecast data from disk");
        return cachedForecast;
    } else {
        // discard cache and get new forecast data
        console.info("loading new forecast data from API");
        const freshForecast = await estimate(solarInfo);
        await writeCachedForecast(freshForecast);
        return freshForecast;
    }
}

async function getCachedForecast() {
    try {
        await createFileIfNotExist(forecastCacheFilename, '{}');
        const cacheFile = await fs.readFile(forecastCacheFilename, { encoding: 'utf8' });
        return JSON.parse(cacheFile);
    } catch (err) {
        console.log(err);
        return undefined;
    }
}

async function writeCachedForecast(forecast) {
    try {
        await fs.writeFile(forecastCacheFilename, JSON.stringify(forecast));
    } catch (err) {
        console.log(err);
    }
}

async function createFileIfNotExist(filename, content) {
    try {
        await fs.readFile(filename, { encoding: 'utf8' });
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(filename, content);
        }
        else throw error;
    }
}

/**
 * Request forecast data for the solar panel installtion described in solarInfo from the solar forecast web service.
 * @param {Object} solarInfo 
 * @returns {Object} Forecast data
 * Example Result
 {
    info: {
        latitude: 51.27,
        longitude: 9.54,
        distance: 0,
        place: 'Crumbacher Straße 48, 34253 Crumbach, Germany',
        timezone: 'Europe/Berlin',
        time: '2024-07-10T11:50:32+02:00',
        time_utc: '2024-07-10T09:50:32+00:00',
        begin: '2024-07-10T05:18:36+02:00',
        end: '2024-07-11T21:35:14+02:00',
    },
    intervals: [
        { timestamp: '2024-07-10T05:18:36+02:00', power: 0 },
        { timestamp: '2024-07-10T06:00:00+02:00', power: 111 },
        ...
    ]
}
 */
async function estimate(solarInfo) {
    const url = `https://api.forecast.solar/estimate/${solarInfo.latitude}/${solarInfo.longitude}/${solarInfo.declination}/${solarInfo.azimut}/${solarInfo.maxPower}`;
    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json"
        }
    });
    console.log(url, response.status);
    if (response.status >= 300) {
        throw { message: `cannot read solar forecast data; status code ${response.status}` };
    }
    const forecast = (await response.json());
    if (!forecast.result.watts) {
        throw { message: `forecast service did not return any forecast data` };
    }
    const intervals = Object.entries(forecast.result.watts).map(a => {
        return {
            // consider the time zone the solar forecast response refers to
            timestamp: dayjs.tz(a[0], forecast.message.info.timezone).format(),
            power: a[1]
        };
    })
    const result = {
        info: forecast.message.info,
        intervals: intervals
    };
    result.info.begin = intervals[0].timestamp;
    result.info.end = intervals[intervals.length - 1].timestamp;
    return result;
};

function isObjectEmpty(objectName) {
    return (
        objectName &&
        Object.keys(objectName).length === 0 &&
        objectName.constructor === Object
    );
};