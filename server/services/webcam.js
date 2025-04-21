'use strict';
import * as fs from 'node:fs';
import path from 'node:path';
import NodeWebcam from 'node-webcam';
import { dirname } from 'node:path';
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

    NodeWebcam.capture('test_picture', opts, function (err, data) {

        const ds = getDaylightTimeString().replace('Z', '').replace(/[^0-9]/g, '-');

        const name = `test_image-${ds}.${opts.output}`;
        const fullPath = path.resolve(__dirname, '../public/images', name);

        const base64Data = data.replace(/^data:image\/jpeg;base64,/, '');
        fs.writeFile(fullPath, base64Data, 'base64', function (err) {
            if (err) {
                throw err;
            }
        });

        const image = `<img src='${data}'>`;

        callback(image);
    });

};

export { getWebCamImage };