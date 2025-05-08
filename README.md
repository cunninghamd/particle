# particle

> An object which is sub-atomic -- smaller than an atom -- and has a definite mass and charge.

A `particle` is defined as a sub-atomic object with definite mass and charge.

particle.local - a personal metrics server to aggregate metrics across a home network and/or personal attributes

TODO: footnote: https://www.reuters.com/article/us-science-cern-glossary-idUSTRE62T1EQ20100330/

### Batteries Included

tools used are likely to include:

- grafana
- graphite
- prometheus

## Getting Started

```
docker compose up -d
```

Then use the following URLs:

- http://localhost:3000 - grafana
- http://localhost:8080 - graphite
- http://localhost:9090 - prometheus

### Notes

- when configuring `grafana` to access `graphite`, keep in mind that you need to reference the docker hostname that's created.
    - grafana: particle-grafana-1
    - graphite: particle-graphite-1
    - prometheus: particle-prometheus-1

## Services, a.k.a. Getting Data

### collider

> An accelerator in which two beams traveling in opposite directions are steered together to induce high-energy collisions between particles in one beam and those in the other.

A `collider` is defined as an accelerator that steers two beams together to induce high-energy collisions.

TODO: footnote

In this case, `collider` retrieves data from a `source`, and pushes it to `graphite` for display within `grafana`.

### configuring services (via collider/nodejs)

Copy `src/config-template.json` to `src/config.json`:

- update the `destination` object as needed.
- add `sources`, for example, to add a 3D printer running `OctoPrint`, sources would be:
```
"sources: {
  "octoprint": {
    "cron": "* * * * *",
    "protocol": "http",
    "url": "octoprint.local",
    "port": null,
    "path": "api/printer",
    "headers": {
      "X-Api-Key": "<octoprint-api-key>"
    },
    "metrics": [
      "sd.ready",
      "temperature.bed.actual",
      "temperature.bed.target",
      "temperature.tool0.actual",
      "temperature.tool0.target"
    ]
  }
}
```

### configuring services (via prometheus)

```
# prometheus.yml
scrape_configs:
  - job_name: 'esp8266'
    static_configs:
      - targets: ['192.168.1.100:8080'] # ESP8266 IP and port
```

#### Faking Stats

Use this command to fake stats to `graphite`:

```
while true; do echo -n "example:$((RANDOM % 100))|c" | nc -w 1 -u 127.0.0.1 8125; done
```

The stats will be available under `stats.example`.

## Glances

To add all glances metrics to graphite, run it with:

```
glances --export graphite
```

using the below config file, stored in `~/.config/glances/glances.conf` on ubuntu:

```
[graphite]
host=localhost
port=2003
# Prefix to be added for all measurements
# Ex: prefix=foo
# => foo.cpu
# => foo.mem
prefix=`hostname`
```
