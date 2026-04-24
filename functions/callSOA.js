const fs = require("fs");
const path = require("path");
const { XMLParser } = require("fast-xml-parser");
const { logMessage } = require("../functions/logMessage");
const { escapeXML } = require("../functions/escapeXML");
const parser = new XMLParser({
    ignoreAttributes: false,
    removeNSPrefix: true
});

const callSOA = async ({ templatePath, replacements }, serviceId, soapAction = "",endpoint = "") => {
    try {
        let data = fs.readFileSync(path.join(__dirname, templatePath), "utf-8");
        for (const [key, value] of Object.entries(replacements)) {
            data = data.replace(`{{${key}}}`, escapeXML(value));
        }
        logMessage(serviceId, null, "Before callSOA", data, "INFO");
        const headersRequest = {
            "Content-Type": "text/xml; charset=UTF-8",        }
        if(soapAction)
        {
            headersRequest["SOAPAction"] = soapAction
        }
        const response = await fetch(process.env.URL_SOA+endpoint, {
            method: "POST",
            headers: headersRequest,
            body: data,
        });
        const xml = await response.text();
        logMessage(serviceId, null, "After callSOA", xml, "INFO");
        const json = await parser.parse(xml);
        return {
            body: json || "",
            status: response.status,
        };
    } catch (error) {
        console.log(error)
        return {
            body: "Error callSOA: " +
                (error.response?.status
                    ? "Estatus (" + error.response.status + ")"
                    : "") +
                (error.message ? " Mensaje: " + error.message : "") +
                (error.response?.data
                    ? " Response: " + error.response.data
                    : ""),
            status: 500,
        };
    }
};

module.exports = { callSOA };