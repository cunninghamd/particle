# particle
particle.local - a personal metrics server to aggregate metrics across a home network and/or personal attributes

### Batteries Included

tools used are likely to include:

- grafana
- graphite

## Getting Started

```
docker compose up -d
```

Then use the following URLs:

- http://localhost:3000 - grafana
- http://localhost:8080 - graphite

### Notes

- when configuring `grafana` to access `graphite`, keep in mind that you need to reference the docker hostname that's created.
    - grafana: particle-grafana-1
    - graphite: particle-graphite-1

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
