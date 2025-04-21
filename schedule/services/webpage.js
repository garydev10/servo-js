'use strict';
import path from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import dotenv from 'dotenv';

import { getDaylightTimeString } from './common.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const dotEnvPath = path.resolve(__dirname, '../', '.env');
dotenv.config({ path: dotEnvPath });

const submitLogin = async (page, username, password) => {
    console.log(`${getDaylightTimeString()} submitLogin start`);
    // wait for the login form
    const submit = '#loginForm > div.form-group > button';
    await page.waitForSelector(submit, { timeout: 300_000 });

    // fill in the login credentials
    await page.$eval('#id_username', (el, value) => el.value = value, username);
    await page.$eval('#id_password', (el, value) => el.value = value, password);

    // click the login button and wait for navigation
    await page.click(submit);
};

const getRateTable = async (page, useTomorrowRate) => {
    console.log(`${getDaylightTimeString()} getRateTable start`);

    // wait for an element on the login redirected page
    // let dayRateSelector = "button ::-p-text(Today)"; // use today rate
    // if (useTomorrowRate) {
    //     dayRateSelector = "button ::-p-text(Tomorrow)"; // use tomorrow rate
    // }
    let dayRateSelector = "::-p-xpath(//button[text()='Today'])"; // use today rate
    if (useTomorrowRate) {
        dayRateSelector = "::-p-xpath(//button[text()='Tomorrow'])"; // use tomorrow rate
    }
    await page.waitForSelector(dayRateSelector, { timeout: 300_000 });
    await page.click(dayRateSelector);


    const halfHourRateSelector = "button ::-p-text(half hourly rates)";
    // const halfHourRateSelector = "::-p-xpath(//button[span[span[text()='half hourly rates']]])";
    await page.waitForSelector(halfHourRateSelector, { timeout: 300_000 });
    await page.click(halfHourRateSelector);

    const priceRowsSelector = "tbody > tr";
    const priceRowsStrings = await page.$$eval(priceRowsSelector, rows => {
        // get array from table td
        return Array.from(rows, row => {
            const columns = row.querySelectorAll('td');
            return Array.from(columns, column => column.innerText);
        });
    });
    return priceRowsStrings;
};

const submitLogout = async (page) => {
    console.log(`${getDaylightTimeString()} submitLogout start`);

    // click logout

    const logout = "span ::-p-text(Log out)";
    await page.waitForSelector(logout, { timeout: 300_000 });
    await page.click(logout);

    // wait till button load
    const buttonSelector = "button";
    return await page.waitForSelector(buttonSelector, { timeout: 300_000 });
};

const getBrowser = async () => {
    console.log(`${getDaylightTimeString()} getBrowser start`);

    let browser = undefined;
    const isWin = process.platform === 'win32';
    if (isWin) {

        browser = await puppeteer.launch({
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            headless: false,
        });

    } else {

        browser = await puppeteer.launch({
            executablePath: '/usr/bin/chromium-browser',
            // executablePath: '/usr/bin/chromium',
            // executablePath: '/home/testadmin/.cache/puppeteer/chrome-headless-shell/linux-128.0.6613.119/chrome-headless-shell-linux64/chrome-headless-shell',
            args: [
                // '--headless=old',
                '--headless',
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-infobars',
            ],
            protocolTimeout: 300_000, // Optional: Increase the protocol timeout if needed
        });

    }

    return browser;
};

const getScheduleRateStrings = async ({
    url,
    username,
    password,
    useTomorrowRate
}) => {

    console.log(`${getDaylightTimeString()} getScheduleRateStrings start`);

    let priceRowsStrings = [];

    const browser = await getBrowser();
    // create a browser page
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(300_000); // set timeout to 5 mins

    try {

        console.log(`${getDaylightTimeString()} getScheduleRateStrings url = ${url}`);
        await page.goto(url, { timeout: 300_000 });

        await submitLogin(page, username, password);

        priceRowsStrings = await getRateTable(page, useTomorrowRate);
        // console.log('priceRowsStrings');
        // console.log(priceRowsStrings);

        await submitLogout(page);

    } catch (err) {
        // Log any errors that occur.
        console.error(err);
    } finally {
        // close the browser
        await browser.close();
    }

    console.log(`${getDaylightTimeString()} getScheduleRateStrings end`);

    return priceRowsStrings;
};

const getScheduleRates = async (useTomorrowRate) => {
    const priceRowsStrings = await getScheduleRateStrings({
        url: 'https://octopus.energy/login',
        username: process.env.SECRET_USERNAME,
        password: process.env.SECRET_PASSWORD,
        useTomorrowRate: useTomorrowRate
    });
    return priceRowsStrings
};

export { getScheduleRates };
