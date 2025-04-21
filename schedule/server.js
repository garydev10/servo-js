
import path from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

import { getDaylightTimeString } from './services/common.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dotEnvPath = path.resolve(__dirname, './', '.env');
dotenv.config({ path: dotEnvPath });

let url = 'http://localhost:5000';

const isWin = process.platform === 'win32';
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

const runServoWebCam = async () => {
  // run servo webcam will cause under voltage and schedule immediately stop and return, 
  // so we cannot switch boiler for 2 times or run schedule after switch
  await runServo();
  return await runWebCam();
}

const getHHM = (hhmm) => {
  return hhmm.substring(0, 4);
}

const runSchedule = async () => {
  const args = process.argv.slice(2);
  const args0 = args[0];
  const hhmm = getHHMM();
  console.log(`${getDaylightTimeString()} runSchedule hhmm = ${hhmm}, url = ${url}, args0 = ${args0}`);

  let data = await (await fetch(`${url}/api/schedules`)).json();
  console.log(data);

  if (!data.schedules) return;
  const schedules = data.schedules;

  for (let i = 0; i < schedules.length; i++) {
    const di = i;
    const schedule = schedules[i];
    console.log(`Check hhmm ${hhmm} === ${schedule} schedule${di} ?`)
    if (getHHM(hhmm) === getHHM(schedule)) {
      console.log(`Run Schedule with Servo and WebCam as hhmm ${hhmm} === ${schedule} schedule${di}.`);
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
