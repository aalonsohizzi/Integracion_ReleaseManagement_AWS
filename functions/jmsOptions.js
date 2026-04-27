// Configuración centralizada para la conexión STOMP/JMS.
// Todas las variables se leen del entorno para no hardcodear credenciales.
module.exports.jmsOptions = {
  host: process.env.JMS_HOST,
  port: Number(process.env.JMS_PORT),
  destination: process.env.JMS_QUEUE,
  connectHeaders: {
    host: '/',
    login: process.env.JMS_USER,
    passcode: process.env.JMS_PASSWORD
  }
};
