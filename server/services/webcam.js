'use strict';
import { writeFile } from 'node:fs';
import NodeWebcam from 'node-webcam';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAverageColor } from 'fast-average-color-node';

import { getDaylightTimeString } from './common.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const getWebCamImage = (callback) => {

    const opts = {
        width: 640,
        height: 480,
        skip: 10,
        frames: 10,
        bottomBanner: true,
        output: 'jpeg',
        callbackReturn: 'base64'
    };

    NodeWebcam.capture('temp-image', opts, function (err, data) {

        const datetimeString = getDaylightTimeString().replace('Z', '').replace(/[^0-9]/g, '-').substring(2, 19);
        getAverageColor(data, {
            left: 110,
            top: 330,
            width: 60,
            height: 60
        }).then(color => {
            let onOff = '';
            if (color) {
                const red = color.value[0];
                if (red >= 127) {
                    onOff = '-on';
                } else {
                    onOff = '-off';
                }
            }
            const fileName = `boiler-${datetimeString}${onOff}.${opts.output}`;
            const fullPath = resolve(__dirname, '../public/images', fileName);

            const base64Data = data.replace(/^data:image\/jpeg;base64,/, '');
            writeFile(fullPath, base64Data, 'base64', function (err) {
                if (err) {
                    throw err;
                }
            });
        }).catch(error => {
            console.error(error);
            throw error;
        });

        const image = `<img src='${data}'>`;

        callback(image);
    });

};

export { getWebCamImage };