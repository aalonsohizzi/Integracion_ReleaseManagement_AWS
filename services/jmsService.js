const fs = require('fs');
const path = require('path');
const stompit = require('stompit');
const { jmsOptions } = require('../functions/jmsOptions');
const { logMessage } = require('../functions/logMessage');

// Fire-and-forget: no se awaita ni afecta al flujo principal.
// Si el broker no está disponible se registra el error y se continúa sin lanzar excepción.
function sendJMSAsync(req, correlationId) {
  let xml = fs.readFileSync(path.join(__dirname, '../requests/jms_insert_log_message.xml'), 'utf8');
  xml = xml
    .replace(/{{GlobalMessageId}}/g, correlationId)
    .replace(/{{MessageId}}/g, correlationId)
    .replace(/{{LogDate}}/g, new Date().toISOString());

  stompit.connect(jmsOptions, (err, client) => {
    if (err) {
      logMessage('JMS', correlationId, 'CONNECT_ERROR', err.message, 'ERROR');
      return;
    }
    const frame = client.send({ destination: jmsOptions.destination });
    frame.write(xml);
    frame.end();
    logMessage('JMS', correlationId, 'SEND_OK', 'Mensaje enviado', 'INFO');
    client.disconnect();
  });
}

module.exports = { sendJMSAsync };
