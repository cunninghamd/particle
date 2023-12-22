import cfg from './config.json';
import cron from 'node-cron';
import Destination from './interfaces/Destination';
import Source from './interfaces/Source';

const config = {
  destination: {
    protocol: cfg.destination.protocol,
    url: cfg.destination.url,
    port: cfg.destination.port ?? 2003,
  },
};

Object.keys(cfg.sources).forEach((source) => {
  config.sources[source] = cfg.sources[source];
});

class Collider {
  async sendToGraphite(destination: Destination, source: Source) {
    const d = destination;
    const port = d.port ? `:${d.port}` : '';
    try {
      const response = await axios.get(`${d.protocol}://${d.url}${port}`);
      const data = response.data;
      
      if (data) {
        source.metrics.forEach((metric) => {
          const datum = this.getDatumByPath(data, metric);
          const sourceName = Object.keys(source)[0]
          graphiteClient.write({ `${sourceName}.${metric}`: datum });
        });
      }
    } catch (error) {
      console.error('Error fetching or logging data:', error.message);
    }
  }
  
  getDatumByPath(obj: Record<string, any>, path: string): any {
    const keys = path.split('.');
    return keys.reduce((acc, key) => (acc && acc[key] ? acc[key] : undefined), obj);
  }
  
  start() {
    config.sources.forEach((source) => {
      cron.schedule(source.cron, await sendToGraphite(config.destination, source));
    });
  }
}

export default Collider;
