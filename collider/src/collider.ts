import axios from "axios";
import AxiosDigestAuth from "@mhoc/axios-digest-auth";
import cron from "node-cron";
import graphite from "graphite";

import cfg from "./config.json";
import Destination from "./interfaces/Destination";
import Source from "./interfaces/Source";

class Collider {
  config = {
    destination: {
      protocol: cfg.destination.protocol,
      url: cfg.destination.url,
      port: cfg.destination.port ?? 2003,
    },
    sources: { ...cfg.sources },
  };

  async sendToGraphite(
    destination: Destination,
    source: Source,
    prefix: string,
  ) {
    const d = destination;
    const dPort = d.port ? `:${d.port}` : "";
    const dPath = d.path ? `/${d.path}` : "";
    const dUri = `${d.protocol}://${d.url}${dPort}${dPath}`;
    console.log(`graphite dest: ${dUri}`);
    const graphiteClient = graphite.createClient(dUri);

    const s = source;
    const sPort = s.port ? `:${s.port}` : "";
    const sPath = s.path ? `${s.path}` : "";
    const sUri = `${s.protocol}://${s.url}${sPort}/${sPath}`;
    try {
      console.log(
        `querying: ${sUri}\nwith headers: ${JSON.stringify(source.headers, null, 2)}`,
      );
      const response = await axios.get(sUri, {
        // @ts-expect-error TS2322
        headers: { ...source.headers },
      });
      if (response.status == 200) {
        const data = response.data;
        console.log(`  data returned: ${JSON.stringify(data, null, 2)}`);

        Object.keys(source.metrics).forEach((metricKey) => {
          // @ts-expect-error TS7053
          const metric = source.metrics[metricKey];
          const datum = this.getDatumByPath(data, metric);
          console.log(`    logging: ${prefix}.${metric}=${datum}`);
          const graphiteMetric = { [`${prefix}.${metric}`]: datum };
          graphiteClient.write(graphiteMetric);
        });
      }
    } catch (error) {
      // @ts-expect-error TS18046
      console.error("Error fetching or logging data:", error.message);
      console.error(error);
    }
  }

  getDatumByPath(obj: Record<string, any>, path: string): any {
    const keys = path.split(".");
    return keys.reduce(
      (acc, key) => (acc !== undefined && acc !== null) ? acc[key] : undefined,
      obj,
    );
  }

  start() {
    Object.keys(this.config.sources).forEach((sourceKey) => {
      // @ts-expect-error TS7053
      const source = this.config.sources[sourceKey];
      cron.schedule(source.cron, () => {
        this.sendToGraphite(this.config.destination, source, sourceKey);
      });
    });
  }
}

export default Collider;
