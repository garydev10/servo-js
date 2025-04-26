'use strict';
import { writeFile } from 'node:fs';
import NodeWebcam from 'node-webcam';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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

        const ds = getDaylightTimeString().replace('Z', '').replace(/[^0-9]/g, '-').substring(2, 19);

        const name = `boiler-${ds}.${opts.output}`;
        const fullPath = resolve(__dirname, '../public/images', name);

        const base64Data = data.replace(/^data:image\/jpeg;base64,/, '');
        writeFile(fullPath, base64Data, 'base64', function (err) {
            if (err) {
                throw err;
            }
        });

        const image = `<img src='${data}'>`;

        callback(image);
    });

};

export { getWebCamImage };