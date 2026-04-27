const { putMetric } = require('./metrics');

// Envuelve una llamada async midiendo latencia y emitiendo métricas de éxito/error/timeout.
// Distingue timeouts (err.code === 'TIMEOUT') del resto de errores para métricas separadas.
// Re-lanza el error para que el caller decida cómo responder.
async function measureExecution({ service, metricSuccess, metricError, metricTimeout, metricLatency, fn }) {
  const start = Date.now();
  try {
    const result = await fn();
    putMetric({ service, metricName: metricSuccess, value: 1 });
    return result;
  } catch (err) {
    if (err.code === 'TIMEOUT') {
      putMetric({ service, metricName: metricTimeout, value: 1 });
    } else {
      putMetric({ service, metricName: metricError, value: 1 });
    }
    throw err;
  } finally {
    putMetric({ service, metricName: metricLatency, value: Date.now() - start, unit: 'Milliseconds' });
  }
}

module.exports = { measureExecution };
