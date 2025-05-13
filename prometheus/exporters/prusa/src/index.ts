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
    // if (path) {
    //   uri += path.startsWith("/") ? path : "/" + path;
    // }

    // @ts-expect-error
    cfg.paths.forEach(async (p) => {
      // @ts-expect-error
      srcMetrics[source] = new Array();

      const fullUri = getFullUri(uri, p.path);
      const response = await fetch(fullUri, {
        headers: headers || {},
      });
      const data = await response.json();

      const pMetrics = processMetrics(data, p.metrics);
      // @ts-expect-error
      srcMetrics[source].push(...pMetrics);
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

function getFullUri(uri: string, path: string) {
  if (path) {
    return uri + (path.startsWith("/") ? path : "/" + path);
  }

  return uri;
}

function processMetrics(data: any, metrics: string[]): string[] {
  const metricData = new Array();

  metrics.forEach((metric) => {
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
      if (metricParts[1] !== undefined) {
        metricStr += ", ";
      }
      metricStr += `value="${datum}"`;
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
    metricData.push(metricStr);
  });

  return metricData;
}

// TODO: return the metrics in each of the app.get scenarios
app.get("/metrics/:source", async (req, res) => {
  const { source } = req.params;
  // @ts-expect-error
  const promMetrics = srcMetrics[source].join("\n");
  res.set("Content-Type", "text/plain");
  res.send(promMetrics);
});

const PORT = 10001;
app.listen(PORT, () => {
  console.log(`Prometheus exporter listening on port ${PORT}...`);
});
