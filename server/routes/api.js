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

    const schedulesOptionsFilePath = path.resolve(__dirname, '../data', 'schedulesOptions.txt');
    const getSchedulesOptions = () => fs.readFileSync(schedulesOptionsFilePath, 'utf-8').toString().split('\n').map(l => l.trim());
    const schedulesFilePath = path.resolve(__dirname, '../data', 'schedules.txt');
    const getSchedulesHHMM = () => fs.readFileSync(schedulesFilePath, 'utf-8').toString().split('\n').map(l => l.trim());

    const isMissing = (field) => field === undefined || field === '';
    

    app.route('/api/time').get((req, res) => {
        try {
            const serverTime = getDaylightTimeString();
            res.json({ serverTime: serverTime });
        } catch (error) {
            console.error(error);
        }

        return;
    });

    app.route('/api/schedules')
        .get((req, res) => {
            try {
                const schedulesHHMM = getSchedulesHHMM();
                res.json({ schedules: schedulesHHMM });
            } catch (error) {
                console.error(error);
            }

            return;
        })
        .post((req, res) => {
            try {
                // console.log(req.body);
                const { schedule, index } = req.body;
                if (isMissing(index) || !Number.isInteger(index)) {
                    res.json({ message: 'schedules index error' });
                    return;
                }
                let schedulesHHMM = getSchedulesHHMM();                
                if (index < 0 || index >= schedulesHHMM.length) {
                    res.json({ message: 'schedules index error' });
                    return;
                }
                if (isMissing(schedule)) {
                    res.json({ message: 'schedules format error' });
                    return;
                }
                const schedulesOptions = getSchedulesOptions();
                if (!schedulesOptions.includes(schedule)) {
                    res.json({ message: 'schedules not found' });
                    return;
                }
                schedulesHHMM[index] = schedule;
                fs.writeFileSync(schedulesFilePath, schedulesHHMM.join('\r\n'));
                res.json({ schedule: schedule, index: index });
            } catch (error) {
                console.error(error);
            }

            return;
        });

    app.route('/api/schedules-options').get((req, res) => {
        try {
            const schedulesOptions = getSchedulesOptions();
            res.json({ schedulesOptions: schedulesOptions });
        } catch (error) {
            console.error(error);
        }

        return;
    });

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
