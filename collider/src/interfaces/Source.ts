interface Source {
  [key: string]: {
    cron: string,
    protocol: string,
    url: string,
    port?: string,
    headers?: object,
  }
}

export default Source;
