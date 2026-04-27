// Emite métricas en formato EMF (Embedded Metric Format) de CloudWatch.
// Los logs con este formato son procesados automáticamente por CloudWatch Logs
// y publicados en el namespace 'Impulse/Integrations' sin necesidad de agente.
function putMetric({ service, metricName, value, unit = 'Count' }) {
  console.log(JSON.stringify({
    _aws: {
      Timestamp: Date.now(),
      CloudWatchMetrics: [{
        Namespace: 'Impulse/Integrations',
        Dimensions: [['Service']],
        Metrics: [{ Name: metricName, Unit: unit }]
      }]
    },
    Service: service,
    value
  }));
}

module.exports = { putMetric };
