const fs = require('fs');
const path = require('path');
const { fetchWithTimeout } = require('../functions/fetchWithTimeout');
const { httpOptions } = require('../functions/httpOptions');

// Construye el body leyendo la plantilla JSON y sustituyendo placeholders {{campo}}.
// Lanza error estructurado con httpStatus para que measureExecution pueda clasificarlo.
class RestService {
  async callExternalService(req) {
    let body = fs.readFileSync(path.join(__dirname, '../requests/impulseUpgrade_rest_template.json'), 'utf8');
    Object.entries(req).forEach(([k, v]) => {
      body = body.replace(new RegExp(`{{${k}}}`, 'g'), v);
    });

    const response = await fetchWithTimeout(
      process.env.REST_ENDPOINT,
      { headers: httpOptions.headers, method: 'POST', body },
      httpOptions.timeout
    );

    if (!response.ok) {
      const err = new Error(`HTTP_${response.status}`);
      err.httpStatus = response.status;
      throw err;
    }

    return response.json();
  }
}

module.exports = { RestService };
