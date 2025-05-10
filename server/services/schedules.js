"use strict";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const schedulesOptionsFilePath = resolve(
  __dirname,
  "../data",
  "schedulesOptions.txt"
);

const getSchedulesOptions = () =>
  readFileSync(schedulesOptionsFilePath, "utf-8")
    .toString()
    .split("\n")
    .map((l) => l.trim());

const schedulesFilePath = resolve(__dirname, "../data", "schedules.txt");

const getSchedulesHHMM = () =>
  readFileSync(schedulesFilePath, "utf-8")
    .toString()
    .split("\n")
    .map((l) => l.trim());

const writeSchedulesHHMM = (schedulesHHMM) =>
  writeFileSync(schedulesFilePath, schedulesHHMM.join("\r\n"));

export { getSchedulesOptions, getSchedulesHHMM, writeSchedulesHHMM };
