interface Source {
  [key: string]: {
    cron: string;
    protocol: string;
    url: string;
    port?: string;
    path: string;
    headers?: object;
    digestAuth?: {
      username: string;
      password: string;
    };
    metrics: string[];
  };
}

export default Source;
