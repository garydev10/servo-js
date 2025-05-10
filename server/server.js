"use strict";
import express from "express";
import serveIndex from "serve-index";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { apiRoutes } from "./routes/api.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.route("/").get(function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

app.use("/public", express.static(__dirname + "/public"));

// enable image web listing
app.use("/public/images", serveIndex(__dirname + "/public/images"));

//Routing for API
apiRoutes(app);

//404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404).type("text").send("Not Found");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
