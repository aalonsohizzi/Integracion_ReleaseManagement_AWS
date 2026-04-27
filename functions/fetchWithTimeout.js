// err.code = 'TIMEOUT' permite que measureExecution distinga timeouts de otros errores
// y emita la métrica correcta (metricTimeout vs metricError).
async function fetchWithTimeout(url, options = {}, timeout = 30000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => {
      setTimeout(() => {
        const err = new Error('REQUEST_TIMEOUT');
        err.code = 'TIMEOUT';
        reject(err);
      }, timeout);
    })
  ]);
}

module.exports = { fetchWithTimeout };
