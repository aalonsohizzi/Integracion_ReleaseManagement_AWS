function logMessage(serviceId, businessMsgId, subprocess, message, logLevel) {
  const msg = typeof message === 'object' ? JSON.stringify(message) : message;
  const text = `${serviceId} - ${subprocess} - ${businessMsgId} - ${msg}`;
  logLevel === 'ERROR' ? console.error(text) : console.log(text);
}

module.exports = { logMessage };
