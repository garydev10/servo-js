import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

import { getDaylightTimeString } from "./services/common.js";
import { getScheduleRates } from "./services/webpage.js";
import { processScheduleRates } from "./services/scheduleRate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dotEnvPath = resolve(__dirname, "./", ".env");
config({ path: dotEnvPath });

let url = "http://localhost:5000";

const isWin = process.platform === "win32";
// for test in windows pc
if (isWin) {
  url = `http://${process.env.SECRET_SERVER_IP}:5000`;
}

const getHHMM = () => {
  const ds = getDaylightTimeString().substring(11, 16);
  return ds;
};

const runWebCam = async () => {
  const res = await fetch(`${url}/api/webcam`);
  const data = await res.json();
  // console.log(data);
  return data;
};

const runServo = async () => {
  const res = await fetch(`${url}/api/servo`);
  const data = await res.json();
  // console.log(data);
  return data;
};

const getUpdatedRates = async () => {
  const res = await fetch(`${url}/api/schedule-rates`);
  const data = await res.json();
  // console.log(data);
  return data;
};

const updateScheduleRates = async (scheduleRateStrings, useTomorrowRate) => {
  // update server rate table
  const res = await fetch(`${url}/api/schedule-rates`, {
    method: "POST",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      date: getDaylightDateString(useTomorrowRate),
      scheduleRates: scheduleRateStrings,
    }),
  });
  const data = await res.json();
  return data;
};

const getDaylightDateString = (useTomorrowRate) => {
  const rightNow = new Date();
  if (useTomorrowRate) {
    rightNow.setDate(rightNow.getDate() + 1);
  }
  rightNow.setMinutes(rightNow.getMinutes() - rightNow.getTimezoneOffset());
  let ds = rightNow.toISOString();
  ds = ds.substring(0, 10);
  return ds;
};

const runScheduleRates = async (useTomorrowRate) => {
  console.log(
    `${getDaylightTimeString()} runScheduleRates useTomorrowRate = ${useTomorrowRate}`
  );
  const priceRowsStrings = await getScheduleRates(useTomorrowRate);
  console.log("priceRowsStrings");
  console.log(priceRowsStrings);

  let scheduleRateStrings = priceRowsStrings.map(([time, rate]) => ({
    time: time.split("\n")[1].substring(0, 5),
    rate: rate.split("\n")[1].replace("p/kWh", ""),
  }));
  scheduleRateStrings = processScheduleRates(scheduleRateStrings);
  console.log("scheduleRateStrings");
  console.log(scheduleRateStrings);

  if (scheduleRateStrings && scheduleRateStrings.length > 0) {
    await updateScheduleRates(scheduleRateStrings, useTomorrowRate);
  }

  return;
};

const runServoWebCam = async () => {
  // run servo webcam will cause under voltage and schedule immediately stop and return,
  // so we cannot switch boiler for 2 times or run schedule after switch
  await runServo();
  return await runWebCam();
};

const getHHM = (hhmm) => {
  return hhmm.substring(0, 4);
};

const runSchedule = async () => {
  const args = process.argv.slice(2);
  const args0 = args[0];
  const hhmm = getHHMM();
  console.log(
    `${getDaylightTimeString()} runSchedule hhmm = ${hhmm}, url = ${url}, args0 = ${args0}`
  );

  // for test in windows pc
  let useTomorrowRate = true;
  if (isWin || args0 === "1" || args0 === "0") {
    // test
    if (args0 === "0") {
      useTomorrowRate = false;
    }
    await runScheduleRates(useTomorrowRate);
  } else if (getHHM(hhmm) === getHHM("20:00")) {
    // get rate again if 20:00 update failed to get data
    let isRetry = true;
    let retryRemain = 3;
    while (isRetry && --retryRemain > 0) {
      try {
        await runScheduleRates(useTomorrowRate);
        const data = await getUpdatedRates();
        if (data.scheduleRates && data.scheduleRates.length > 0) {
          isRetry = false;
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  let data = await (await fetch(`${url}/api/schedules`)).json();
  console.log(data);

  if (!data.schedules) return;
  const schedules = data.schedules;

  for (let i = 0; i < schedules.length; i++) {
    const di = i;
    const schedule = schedules[i];
    console.log(`Check hhmm ${hhmm} === ${schedule} schedule${di} ?`);
    if (getHHM(hhmm) === getHHM(schedule)) {
      console.log(
        `Run Schedule with Servo and WebCam as hhmm ${hhmm} === ${schedule} schedule${di}.`
      );
      await runServoWebCam();
    }
  }

  return;
};

// async main function
(async () => {
  console.log(`${getDaylightTimeString()} app start...`);
  try {
    await runSchedule();
  } catch (error) {
    console.error(error);
  }
  console.log(`${getDaylightTimeString()} app end`);
})();
