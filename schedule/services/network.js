"use strict";

import { promisify } from "node:util";
import { exec } from "node:child_process";

const execAsync = promisify(exec);
const platform = process.platform;

const turnOffWifi = async () => {
  if (platform !== "linux") return;
  const { stdout, stderr } = await execAsync("nmcli radio wifi off");
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
};

const turnOnWifi = async () => {
  if (platform !== "linux") return;
  const { stdout, stderr } = await execAsync("nmcli radio wifi on");
  console.log(`stdout: ${stdout}`);
  console.error(`stderr: ${stderr}`);
};

const getNetworkStatus = async () => {
  let isDown = false;
  const gatewayIp = "192.168.1.1";
  let cmd = `ping ${gatewayIp}`;
  if (platform === "linux") {
    cmd = `${cmd} -c 3`;
  }
  try {
    await execAsync(cmd, { timeout: 5000 });
  } catch (error) {
    console.error(error);
    isDown = true;
  }
  return { isDown, gatewayIp };
};

export { getNetworkStatus, turnOffWifi, turnOnWifi };
