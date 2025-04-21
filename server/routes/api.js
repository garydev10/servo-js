'use strict';
import * as fs from 'node:fs';
import path from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import bodyParser from 'body-parser';

import { getDaylightTimeString } from '../services/common.js';
import { getWebCamImage } from '../services/webcam.js';
import { triggerServo } from '../services/servo.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function apiRoutes(app) {

    // Use body-parser to Parse POST Requests
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());


    app.route('/api/webcam').get((req, res) => {
        try {
            getWebCamImage((image) => {
                res.send(image);
            });
            return;
        } catch (error) {
            console.error(error);
        }

        return;
    });

    app.route('/api/servo').get(async (req, res) => {
        try {
            await triggerServo();
            res.json({ message: 'Servo triggered!' });
        } catch (error) {
            console.error(error);
        }

        return;
    });

}
