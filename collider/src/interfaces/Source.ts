interface Source {
  [key: string]: {
    cron: string;
    protocol: string;
    url: string;
    port?: string;
    path: string;
    headers?: object;
    metrics: string[];
  };
}

export default Source;
