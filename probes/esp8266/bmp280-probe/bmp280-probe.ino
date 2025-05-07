#include <Wire.h>
#include <SPI.h>
#include <Adafruit_BMP280.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include "secrets.h"

#define BMP_SCK  (13)
#define BMP_MISO (12)
#define BMP_MOSI (11)
#define BMP_CS   (10)

Adafruit_BMP280 bmp; // I2C

// start web server
ESP8266WebServer server(80);

void setup() {
  Serial.begin(74880);
  while ( !Serial ) delay(100);

  WiFi.hostname(hostname);
  Serial.print("Setting hostname: ");
  Serial.println(hostname);
  WiFi.begin(ssid, password);
  Serial.print("Connecting to ssid: ");
  Serial.println(ssid);
  while (WiFi.status() != WL_CONNECTED) {
    delay(250);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());

  unsigned status;
  status = bmp.begin(0x76);
  if (!status) {
    Serial.println("Error: no valid BMP280 sensor, check wiring!");
    while (1) {
      yield();
      delay(10);
    }
  }

  /* Default settings from datasheet. */
  bmp.setSampling(Adafruit_BMP280::MODE_NORMAL,     /* Operating Mode. */
                  Adafruit_BMP280::SAMPLING_X2,     /* Temp. oversampling */
                  Adafruit_BMP280::SAMPLING_X16,    /* Pressure oversampling */
                  Adafruit_BMP280::FILTER_X16,      /* Filtering. */
                  Adafruit_BMP280::STANDBY_MS_500); /* Standby time. */

  // Prometheus metrics endpoint
  server.on("/metrics", HTTP_GET, []() {
    float temp = bmp.readTemperature();
    float pressure = bmp.readPressure() / 1000.0;

    String response;
    response += "# HELP temp Temperature in Celsius\n";
    response += "# TYPE temp gauge\n";
    response += "temp ";
    response += String(temp, 2);
    response += "\n";

    response += "# HELP pressure Pressure in kPa\n";
    response += "# TYPE pressure gauge\n";
    response += "pressure ";
    response += String(pressure, 2);
    response += "\n";

    server.send(200, "text/plain", response);
  });

  server.begin();
}

void loop() {
  server.handleClient();

  float temp = bmp.readTemperature();
  Serial.print(F("Temperature = "));
  Serial.print(temp);
  Serial.println(" *C");

  float pressure = bmp.readPressure()/1000;
  Serial.print(F("Pressure = "));
  Serial.print(pressure);
  Serial.println(" kPa");

  Serial.print(F("IP = "));
  Serial.println(WiFi.localIP());

  Serial.println();

  delay(1000);
}
