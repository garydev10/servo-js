"use strict";
import { writeFile } from "node:fs";
import NodeWebcam from "node-webcam";
import sharp from 'sharp';
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { getAverageColor } from "fast-average-color-node";

import { getDaylightTimeString } from "./common.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const getWebCamImage = (callback) => {
  const opts = {
    width: 640,
    height: 480,
    skip: 10,
    frames: 10,
    bottomBanner: true,
    output: "jpeg",
    callbackReturn: "base64",
  };

  NodeWebcam.capture("temp-image", opts, function (err, data) {
    const datetimeString = getDaylightTimeString()
      .replace("Z", "")
      .replace(/[^0-9]/g, "-")
      .substring(2, 19);

    const onOffLightRect = {
      left: 110,
      top: 330,
      width: 60,
      height: 60,
    };
    // Create an SVG rectangle as the frame
    const svgRect = `
      <svg width="${opts.width}" height="${opts.height}">
      <rect x="${onOffLightRect.left}" y="${onOffLightRect.top}" width="${onOffLightRect.width}" height="${onOffLightRect.height}"
        fill="none" stroke="green" stroke-width="4" />
      </svg>
    `;

    getAverageColor(data, onOffLightRect)
      .then((color) => {
        let onOff = "";
        if (color) {
          const red = color.value[0];
          if (red >= 127) {
            onOff = "-on";
          } else {
            onOff = "-off";
          }
        }
        const fileName = `boiler-${datetimeString}${onOff}.${opts.output}`;
        const fullPath = resolve(__dirname, "../public/images", fileName);

        // Overay the rectangle on the image data
        const base64Data = data.replace(/^data:image\/jpeg;base64,/, "");
        const dataBuffer = Buffer.from(base64Data, "base64");
        sharp(dataBuffer)
          .composite([{ input: Buffer.from(svgRect), top: 0, left: 0 }])
          .toBuffer()
          .then((outputBuffer) => {

            const data2 = `data:image/jpeg;base64,${outputBuffer.toString("base64")}`;
            const image = `<img src='${data2}'>`;
            callback(image);
            
            writeFile(fullPath, outputBuffer, function (err) {
              if (err) {
                throw err;
              }
            });

          })
          .catch((error) => {
            throw error;
          });

      });

  });
};

export { getWebCamImage };
