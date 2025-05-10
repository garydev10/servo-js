"use strict";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { isMissing } from "../services/common.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const scheduleRatesFilePath = resolve(
  __dirname,
  "../data",
  "scheduleRates.json"
);

const getScheduleTable = () => {
  const jsonString = readFileSync(scheduleRatesFilePath, "utf-8");
  if (isMissing(jsonString)) {
    throw "schedule rates format error";
  }
  const scheduleTable = JSON.parse(jsonString);
  return scheduleTable;
};

const updateScheduleTable = (date, scheduleRates) => {
  const jsonString = JSON.stringify({ date, scheduleRates });
  writeFileSync(scheduleRatesFilePath, jsonString);
};

export { getScheduleTable, updateScheduleTable };
