### **arduino-cli** (Official Arduino CLI)

The official command-line interface from Arduino. It's the most modern and well-supported option.

```bash
# Install
curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh

# Initialize and update core index
arduino-cli core update-index

# Install ESP8266 core
arduino-cli core install esp8266:esp8266

# Compile a sketch
arduino-cli compile --fqbn esp8266:esp8266:generic /path/to/sketch

# Upload to device
arduino-cli upload -p /dev/ttyUSB0 --fqbn esp8266:esp8266:generic /path/to/sketch
