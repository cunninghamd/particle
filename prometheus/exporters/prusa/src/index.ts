import express from "express";
import fetch from "node-fetch";

// @ts-expect-error
import cfg from "./config.json";

const app = express();

const config = {
  sources: { ...cfg.sources },
};

const srcMetrics = {};

async function updateMetrics() {
  for (const [source, cfg] of Object.entries(config.sources)) {
    // @ts-expect-error
    let { protocol, url, port, path, headers } = cfg;
    let uri = `${protocol}://${url}`;
    if (port) {
      uri += `:${port}`;
    }
    if (path) {
      uri += path.startsWith("/") ? path : "/" + path;
    }
    const response = await fetch(uri, {
      headers: headers || {},
    });
    const data = await response.json();
    // console.log(data);

    // @ts-expect-error
    srcMetrics[source] = new Array();

    // @ts-expect-error
    Object.keys(cfg.metrics).forEach((metricKey) => {
      // @ts-expect-error TS7053
      const metric = cfg.metrics[metricKey];
      // console.log("DATA: %o", data);
      // console.log("METRIC: %o", metric);
      const metricParts = metric.split(".");
      const datum = getDatumByPath(data, metric);

      // group
      let metricStr = `${metricParts[0]}`;
      if (metricStr.length > 1) {
        metricStr += "{";
      }
      // type
      if (metricParts[1] !== undefined) {
        metricStr += `type="${metricParts[1]}"`;
      }
      // name
      if (metricParts[2] !== undefined) {
        metricStr += `, name="${metricParts[2]}"`;
      }
      // value (if string)
      if (typeof datum === "string") {
        metricStr += `, value="${datum}"`;
      }
      if (metricStr.length > 1) {
        metricStr += "}";
      }
      if (typeof datum === "string") {
        metricStr += " 1"; // dummy value for string metrics
      } else if (typeof datum === "boolean") {
        metricStr += ` ${datum === true ? 1 : 0}`;
      } else if (datum !== undefined && datum !== null) {
        metricStr += ` ${datum.toString()}`;
      }

      // console.log(metricStr);
      // @ts-expect-error
      srcMetrics[source].push(metricStr);
    });
  }
}

setInterval(updateMetrics, 5000); // Every 5 seconds
updateMetrics();

function getDatumByPath(obj: Record<string, any>, path: string): any {
  const keys = path.split(".");
  return keys.reduce(
    (acc, key) => (acc !== undefined && acc !== null ? acc[key] : undefined),
    obj,
  );
}

// TODO: return the metrics in each of the app.get scenarios
app.get("/metrics/:source", async (req, res) => {
  const { source } = req.params;
  // @ts-expect-error
  const promMetrics = srcMetrics[source].join("\n");
  res.set("Content-Type", "text/plain");
  res.send(promMetrics);
});

// app.get("/metrics/:source", async (_req, res) => {
//   const { source } = req.params;
//   res.set("Content-Type", register.contentType);
//   res.end(await register.metrics(source));
// });

const PORT = 10001;
app.listen(PORT, () => {
  console.log(`Prometheus exporter listening on port ${PORT}...`);
});
