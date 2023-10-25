const client = require('prom-client');
const express = require('express');

const metricExporter = require('./mymetrics');

const app = express();

// Initialize metrics
const registry = new client.Registry();
metricExporter(registry);

// Report Prometheus metrics on /metrics
app.get('/metrics', async (req, res, next) => {
  res.set('Content-Type', registry.contentType);
  res.end(await registry.metrics());
  // console.log(new Date(), 'get')
  next();
});


app.listen(9200, () => console.log('Nodejs exporter started.'));

/* by https://github.com/pavlovdog/grafana-prometheus-node-js-example */
