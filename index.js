const client = require('prom-client');
const express = require('express');
const metricExporter = require('./mymetrics');

const app = express();
const port = process.env.NODEXPORTER_PORT || 9200
const host = process.env.NODEXPORTER_HOST || ''
const updateInterval = process.env.NODEXPORTER_UPD_INTERVAL || 15000

/* by https://github.com/pavlovdog/grafana-prometheus-node-js-example */
// Initialize metrics
const registry = new client.Registry();
metricExporter(registry, updateInterval);

// Report Prometheus metrics on /metrics
app.get('/metrics', async (req, res, next) => {
  res.set('Content-Type', registry.contentType);
  res.end(await registry.metrics());
  // console.log(new Date(), 'get')
  next();
});

app.listen(port, host, () =>
  console.log(`Nodejs exporter started on ${host || '*'}:${port}`));
var listeners = process.listeners('SIGINT');
for (var i = 0; i < listeners.length; i++) {
  console.log(listeners[i].toString());
}

process.on('SIGINT', () => process.exit(0));
