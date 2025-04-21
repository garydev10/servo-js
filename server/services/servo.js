'use strict';
import {Gpio} from 'pigpio';

const triggerServo = async () => {

    const SERVO_DELAY = 100;
    const SERVO_MIN = 500;
    const SERVO_MAX = SERVO_MIN + 2000; // 2500
    const SERVO_MID = SERVO_MIN + 1000; // 1500

    const servo = new Gpio(22, { mode: Gpio.OUTPUT });

    // 360 deg rc servo stop
    let pulseWidth = SERVO_MID;
    servo.servoWrite(pulseWidth);

    // move once and back
    // 360 deg rc servo CCW rotation
    await new Promise(r => setTimeout(r, SERVO_DELAY));
    pulseWidth = SERVO_MAX;
    servo.servoWrite(pulseWidth);

    // 360 deg rc servo CW rotation
    await new Promise(r => setTimeout(r, SERVO_DELAY + 100));
    pulseWidth = SERVO_MIN;
    servo.servoWrite(pulseWidth);

    // 360 deg rc servo stop
    await new Promise(r => setTimeout(r, SERVO_DELAY));
    pulseWidth = SERVO_MID;
    servo.servoWrite(pulseWidth);

    return;
};

export { triggerServo };