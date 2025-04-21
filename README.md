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
## Chromium Browser get fee table
* must use chromium-browser to get web page, use chromium unified browser will hang
```shell
# path=/usr/bin/chromium-browser

# downgrade chromium-browser and chromedriver to version 126 instead of broken 129
wget -O cb.deb "http://archive.raspberrypi.org/debian/pool/main/c/chromium-browser/chromium-browser_126.0.6478.164-rpt1_arm64.deb" 
wget -O l10n.deb "http://archive.raspberrypi.org/debian/pool/main/c/chromium-browser/chromium-browser-l10n_126.0.6478.164-rpt1_all.deb" 
wget -O ffmpeg_extra.deb "http://archive.raspberrypi.org/debian/pool/main/c/chromium-browser/chromium-codecs-ffmpeg-extra_126.0.6478.164-rpt1_arm64.deb" 

sudo apt install -fy --allow-downgrades --allow-change-held-packages cb.deb l10n.deb ffmpeg_extra.deb 

# for selenium only
wget -O chromedriver.deb "http://archive.raspberrypi.org/debian/pool/main/c/chromium-browser/chromium-chromedriver_126.0.6478.164-rpt1_arm64.deb" 

sudo apt install -fy --allow-downgrades --allow-change-held-packages chromedriver.deb 
```