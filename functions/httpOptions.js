// Configuración centralizada para peticiones HTTP REST/JSON.
// REQUEST_TIMEOUT_MS puede sobreescribirse por variable de entorno para ajustar el timeout
// sin redesplegar código (útil para endpoints lentos en producción).
module.exports.httpOptions = {
  timeout: Number(process.env.REQUEST_TIMEOUT_MS || 30000),
  headers: { 'Content-Type': 'application/json' }
};
