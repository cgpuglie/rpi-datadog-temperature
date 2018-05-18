# RPi Datadog Temperature Collector
A docker container for collecting metrics from a GPIO temperature sensor to be sent to Datadog. This was intended to be used for homebrewing, but can be used for anything where real time temperature data is desired.

## Prerequisites
### Hardware setup
First, we need to connect the thermometer to the Raspberry pi and load the drivers. I used [modmypi's tutorial](https://www.modmypi.com/blog/ds18b20-one-wire-digital-temperature-sensor-and-the-raspberry-pi) to get this set up.

### Create a free tier Datadog account
You should be able to keep these metrics with 1 day of retention with a [free-tier datadog account](https://www.datadoghq.com/pricing/). Create an account, and add [an app key and an api key](https://docs.datadoghq.com/api/?lang=python#authentication) for our client to authenticate.

### Install Docker on your Raspberry Pi
Install the latest version of [docker](https://docs.docker.com/install/linux/docker-ce/debian/)

## Usage
1) Pull the code to your raspberry pi.
```bash
git clone git@github.com:cgpuglie/rpi-datadog-temperature 
```
2) Create a docker-compose file in the repo directory with your desired configuration. For example:
```yaml
version: '3.1'
services:
  pi-dd-temp:
    image: pi-dd-temp
    privileged: true
    restart: always
    build: .
    devices:
      - /dev/gpiomem:/dev/gpiomem
    volumes:
      - /lib/modules:/lib/modules
    environment:
      DD_METRIC_NAME: 'belgian-strong.temperature'
      DD_API_KEY: 'my-api-key'
      DD_APP_KEY: 'my-app-key'
      DD_ENDPOINT: 'api.datadoghq.com'
      GRANULARITY: 20000
      DEVICE: '28-0417a2ef0dff'
```
These options are available for configuring the behavior of the client. The values shown are default.
```bash
# Datadog configuration
## Metric name, how it will appear in datadog
DD_METRIC_NAME='temperature',
# Authentication info
DD_API_KEY='',
DD_APP_KEY='',
DD_ENDPOINT='api.datadoghq.com',
# App configuration
## How frequently to pull for temperature, in ms
GRANULARITY=20000,
## Name of the device, found with `cd /sys/bus/w1/devices/; ls`
## See tutorial for setting up thermometer for more information
DEVICE=''
```

3) Build the image.
```bash
docker-compose build
```
Note: This may take a little bit due to i/o performance on the raspberry pi. I have considered mounting `/var/lib/docker` to a usb drive or tmpfs, but haven't experimented with this. If you understand the implications and want to try it, feel free.

4) Run the image in the background.
```bash
docker-compose up -d
```

That's it. You should see metrics showing up in Datadog.