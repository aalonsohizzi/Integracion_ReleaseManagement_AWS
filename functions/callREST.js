// Utilidad para consumir servicios REST/JSON externos.
// Equivalente a callSOA.js pero para endpoints que usan JSON en lugar de SOAP/XML.
// Usar cuando el backend expone un endpoint REST en lugar de un servicio SOAP.
//
// Parámetros:
//   config.endpoint  - Path del recurso, se concatena con URL_SOA del env (o config.baseUrl si se provee)
//   config.method    - Método HTTP (default: 'POST')
//   config.body      - Cuerpo de la petición como objeto JS; se serializa a JSON automáticamente
//   config.headers   - Headers adicionales que se mezclan con los defaults (Content-Type, Accept)
//   config.baseUrl   - URL base alternativa; si se omite usa process.env.URL_SOA
//   serviceId        - Identificador del servicio para los logs (igual que en callSOA)
//   requestId        - ID de correlación proveniente de API GW (event.requestContext.requestId)
//                      Permite rastrear un request completo en CloudWatch Logs
//
// Retorna: { body: object|string, status: number }
//   body  - Respuesta parseada como JSON si el Content-Type es application/json, texto plano en otro caso
//   status - Código HTTP de la respuesta

const { logMessage } = require("./logMessage");
const { fetchWithTimeout } = require("./fetchWithTimeout");

const callREST = async (
    { endpoint, method = "POST", body, headers = {}, baseUrl },
    serviceId,
    requestId = "N/A"
) => {
    try {
        const url = (baseUrl ?? process.env.URL_SOA) + endpoint;

        const requestHeaders = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            // Los headers adicionales pueden sobrescribir los defaults si es necesario
            ...headers,
        };

        const fetchOptions = {
            method,
            headers: requestHeaders,
            // Solo adjuntar body en métodos que lo permiten (no GET/HEAD)
            ...(body && method !== "GET" && method !== "HEAD"
                ? { body: JSON.stringify(body) }
                : {}),
        };

        logMessage(serviceId, requestId, "Before callREST", JSON.stringify({ url, method, body }), "INFO");

        const response = await fetchWithTimeout(url, fetchOptions);

        // Parsear según el Content-Type que devuelva el servidor
        const contentType = response.headers.get("content-type") ?? "";
        let responseBody;
        if (contentType.includes("application/json")) {
            responseBody = await response.json();
        } else {
            // Si el servidor responde con otro formato se retorna como texto para no perder información
            responseBody = await response.text();
        }

        logMessage(
            serviceId,
            requestId,
            "After callREST",
            JSON.stringify({ status: response.status, body: responseBody }),
            "INFO"
        );

        return {
            body: responseBody,
            status: response.status,
        };
    } catch (error) {
        logMessage(serviceId, requestId, "Error callREST", error.message, "ERROR");
        return {
            body: "Error callREST: " + error.message,
            status: 500,
        };
    }
};

module.exports = { callREST };
