# servo-js
A full-stack website and scheduler to press the boiler button, capture webcam images, and show the fee table, running on a Raspberry Pi 3B.

## Web Server
* Raspberry Pi 3 Model B, Debian minimal image
```shell
sudo apt install -y nodejs npm
```
## Boiler Button Press
* Continuous Rotation Servo DS04-NFC
* Rotate CCW 100 ms and then CW 200 ms to press the button and retract
* Servo control using Raspberry Pi PIN 22 by pigpio
* Schedule job check every 30 mins to determine if need press boiler and capture result image
```shell
sudo apt install pigpio
```
## Webcam Capture
* Trust Spotlight Pro Webcam with Microphone, LED Lights and Smart Stand, Videocamera, USB Plug and Play
* webcam capture using node-webcam with fswebcam,v4l-utils
* image serving using serve-index
```shell
sudo apt install fswebcam v4l-utils
# test capture
fswebcam -r 640x480 -S 10 -F 10 image.jpg
```
