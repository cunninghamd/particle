import express from "express";
import fetch from "node-fetch";
import client from "prom-client";

import cfg from "./config.json";

const app = express();
const register = new client.Registry();

config = {
  sources: { ...cfg.sources },
};

// Define a metric (adjust the name/description as needed)
const metricsConfig = [
  { name: "telemetry_temp_bed", help: "Telemetry: Bed temperature", path: ["telemetry", "temp-bed"] },
  { name: "telemetry_temp_nozzle", help: "Telemetry: Nozzle temperature", path: ["telemetry", "temp-nozzle"] },
  { name: "telemetry_print_speed", help: "Telemetry: Print speed", path: ["telemetry", "print-speed"] },
  { name: "telemetry_z_height", help: "Telemetry: Z height", path: ["telemetry", "z-height"] },
  { name: "telemetry_material", help: "Telemetry: Material", path: ["telemetry", "material"] },
  { name: "temperature_tool0_actual", help: "Temperature: Tool 0 actual", path: ["temperature", "tool0", "actual"] },
  { name: "temperature_tool0_target", help: "Temperature: Tool 0 target", path: ["temperature", "tool0", "target"] },
  { name: "temperature_tool0_display", help: "Temperature: Tool 0 display", path: ["temperature", "tool0", "display"] },
  { name: "temperature_tool0_offset", help: "Temperature: Tool 0 offset", path: ["temperature", "tool0", "offset"] },
  { name: "temperature_bed_actual", help: "Temperature: Bed actual", path: ["temperature", "bed", "actual"] },
  { name: "temperature_bed_target", help: "Temperature: Bed target", path: ["temperature", "bed", "target"] },
  { name: "temperature_bed_offset", help: "Temperature: Bed offset", path: ["temperature", "bed", "offset"] },
  { name: "state_flags_operational", help: "State: flags.operational", path: ["state", "flags", "operational"] },
  { name: "state_flags_paused", help: "State: flags.paused", path: ["state", "flags", "paused"] },
  { name: "state_flags_printing", help: "State: flags.printing", path: ["state", "flags", "printing"] },
  { name: "state_flags_cancelling", help: "State: flags.cancelling", path: ["state", "flags", "cancelling"] },
  { name: "state_flags_pausing", help: "State: flags.pausing", path: ["state", "flags", "pausing"] },
  { name: "state_flags_error", help: "State: flags.error", path: ["state", "flags", "error"] },
  { name: "state_flags_sdReady", help: "State: flags.sdReady", path: ["state", "flags", "sdReady"] },
  { name: "state_flags_closedOnError", help: "State: flags.closedOnError", path: ["state", "flags", "closedOnError"] },
  { name: "state_flags_ready", help: "State: flags.ready", path: ["state", "flags", "ready"] },
  { name: "state_flags_busy", help: "State: flags.busy", path: ["state", "flags", "busy"] }
];
// A map from metric names to gauges
const gauges: Record<string, client.Gauge> = {};
metricsConfig.forEach(({name, help}) => {
  const g = new client.Gauge({ name, help });
  gauges[name] = g;
  register.registerMetric(g);
});
// Add 'state_text' as a label on a gauge, since Prometheus treats strings as labels not metric values
const stateTextGauge = new client.Gauge({
  name: "state_text",
  help: "State text, 1 if present",
  labelNames: ['value']
});
register.registerMetric(stateTextGauge);

// Set default labels and registry
client.collectDefaultMetrics({ register });

// Periodically fetch data from the external API and update the metric
const API_URL = "http://example.com/api/stats"; // <-- Replace this!

async function updateMetrics() {
  try {
    const response = await fetch(API_URL, {
      headers: { "X-Api-Key": "owpNnRH9AfmQ6hP" },
    });
    const data = await response.json();
    // Set all configured metrics
    metricsConfig.forEach(({name, path}) => {
      let val: any = data;
      for (const p of path) {
        if (val && typeof val === "object" && p in val) {
          val = val[p];
        } else {
          val = undefined;
          break;
        }
      }
      const numVal = typeof val === "number" ? val : (typeof val === "boolean" ? (val ? 1 : 0) : 0);
      gauges[name].set(numVal);
    });

    // Special handling for state.text (string)
    if (data?.state?.text && typeof data.state.text === "string") {
      stateTextGauge.labels(data.state.text).set(1);
    }
  } catch (err) {
    // reset all gauges to 0 on error
    for (const g of Object.values(gauges)) {
      g.set(0);
    }
    stateTextGauge.reset();
  }
}
setInterval(updateMetrics, 10000); // Every 10 seconds
updateMetrics();

app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

const PORT = 9469;
app.listen(PORT, () => {
  console.log(`Prometheus exporter listening on port ${PORT}...`);
});
