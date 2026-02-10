# BMP280 Temperature and Pressure Probe

ESP8266-based temperature and pressure sensor that exposes metrics via HTTP in Prometheus format.

## Hardware

- ESP8266 board
- BMP280 sensor (I2C, address 0x76)

## Setup

### Install Arduino CLI

```bash
curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
```

### Install ESP8266 Core

```bash
arduino-cli core update-index
arduino-cli core install esp8266:esp8266
```

### Install Required Libraries

```bash
arduino-cli lib install "Adafruit BMP280 Library"
arduino-cli lib install "Adafruit Unified Sensor"
```

### Configure Secrets

Copy the provided template and fill in your WiFi credentials:

```bash
cp secrets-template.h secrets.h
```

Then edit `secrets.h` with your actual WiFi credentials and desired hostname.

## Building and Uploading

### Compile

```bash
arduino-cli compile
```

### Upload

```bash
arduino-cli upload -p /dev/ttyUSB0
```

Adjust the port (`/dev/ttyUSB0`) to match your device. Common alternatives: `/dev/ttyACM0`, `/dev/ttyUSB1`

## Usage

Once uploaded and connected to WiFi, the probe exposes Prometheus metrics at:

```
http://<device-ip>/metrics
```

Metrics provided:
- `temp` - Temperature in Celsius
- `pressure` - Pressure in kPa
