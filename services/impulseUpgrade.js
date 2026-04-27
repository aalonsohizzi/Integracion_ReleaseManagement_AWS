require('dotenv').config();
const { RestService } = require('./restService');
const { sendJMSAsync } = require('./jmsService');
const { measureExecution } = require('../functions/measureExecution');
const { callSOA } = require('../functions/callSOA');
const { logMessage } = require('../functions/logMessage');

const restService = new RestService();
const serviceId = 'impulseUpgrade';

// Orquesta tres protocolos en paralelo conceptual:
//   1. JMS  - log asíncrono fire-and-forget (no bloquea)
//   2. REST - servicio externo principal (medido con métricas)
//   3. SOA  - backend SOAP (medido con métricas)
// La respuesta combina los resultados de REST y SOA para que el cliente los consuma.
// La validación de parámetros se delega a API Gateway (request validator) para no duplicar lógica.
const impulseUpgrade = async (req, requestId = 'N/A') => {
  const correlationId = req.SerialNumber ?? requestId;
  logMessage(serviceId, correlationId, 'START', 'Inicio servicio', 'INFO');

  // Fire-and-forget: no se await, no afecta latencia ni éxito del request
  sendJMSAsync(req, correlationId);

  const rest = await measureExecution({
    service: 'REST',
    metricSuccess: 'RestSuccess',
    metricError: 'RestError',
    metricTimeout: 'RestTimeout',
    metricLatency: 'RestLatencyMs',
    fn: () => restService.callExternalService(req)
  });

  const soa = await measureExecution({
    service: 'SOA',
    metricSuccess: 'SoaSuccess',
    metricError: 'SoaError',
    metricTimeout: 'SoaTimeout',
    metricLatency: 'SoaLatencyMs',
    fn: () => callSOA({ templatePath: '../requests/impulseUpgrade_soa_template.xml', replacements: req }, serviceId)
  });

  logMessage(serviceId, correlationId, 'END', `REST ${rest ? 'OK' : 'null'} | SOA ${soa?.status}`, 'INFO');
  return { statusCode: 200, body: JSON.stringify({ rest, soa }) };
};

module.exports = { impulseUpgrade };
