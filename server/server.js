"use strict";
import express from "express";
import serveIndex from "serve-index";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { apiRoutes } from "./routes/api.js";
import { getSchedulesOptions, getSchedulesHHMM } from "./services/schedules.js";
import { getDaylightTimeString } from "./services/common.js";
import { getScheduleTable } from "./services/rateTable.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

//Routing for API
apiRoutes(app);

app.use("/public", express.static(__dirname + "/public"));

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.get("/", function (req, res) {
  const schedulesOptions = getSchedulesOptions();

  const schedules = getSchedulesHHMM();
  let uiItems = schedules.map((schedule, i) => {
    const formId = `schedule${i}Form`;
    const dropdownId = `schedule${i}`;
    const jsonResultId = `schedule${i}JsonResult`;
    return { formId, dropdownId, jsonResultId };
  });

  const serverTime = getDaylightTimeString()
    .replace("T", ", ")
    .replace("Z", "");

  const scheduleTable = getScheduleTable();

  res.render("index", {
    schedulesOptions,
    schedules,
    uiItems,
    serverTime,
    scheduleTable,
  });
});

// enable image web listing
app.use("/public/images", serveIndex(__dirname + "/public/images"));

//404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404).type("text").send("Not Found");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
