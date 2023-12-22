interface Destination {
  protocol: string,
  url: string,
  port: string,
  path?: string,
  headers?: object,
}

export default Destination;
