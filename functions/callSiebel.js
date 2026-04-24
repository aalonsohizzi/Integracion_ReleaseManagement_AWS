const fs = require("fs");
const path = require("path");
const { XMLParser } = require("fast-xml-parser");
const { logMessage } = require("../functions/logMessage");
const { escapeXML } = require("../functions/escapeXML");
const { getSecret } = require("../functions/getSecret");
const parser = new XMLParser({
    ignoreAttributes: false,
    removeNSPrefix: true
});

const callSiebel = async ({ templatePath, replacements }, serviceId, soapAction = "") => {
    try {
        let crmCredentials;
        try{
            crmCredentials = await getSecret(`dev/siebel-credentials`)
        }
        catch{
            crmCredentials = {"siebel-user":"","siebel-password":""}
        }
        const user = crmCredentials["siebel-user"] ? crmCredentials["siebel-user"] : process.env.USR_SIEBEL;
        const password = crmCredentials["siebel-password"] ? crmCredentials["siebel-password"] : process.env.PASS_SIEBEL;
        let data = fs.readFileSync(path.join(__dirname, templatePath), "utf-8");
        const header =
            `<UsernameToken xmlns="http://siebel.com/webservices">${user}</UsernameToken>` +
            `<PasswordText xmlns="http://siebel.com/webservices">${password}</PasswordText>`;
        data = data.replace("{{header}}", header);
        for (const [key, value] of Object.entries(replacements)) {
            data = data.replace(`{{${key}}}`, escapeXML(value));
        }
        logMessage(serviceId, null, "Before callSiebel", data, "INFO");
        const auth = btoa(`${process.env.USR_SIEBEL}:${process.env.PASS_SIEBEL}`);
        const headersRequest = {
            "Content-Type": "text/xml; charset=UTF-8",
            "Authorization": `Basic ${auth}`
        }
        if(soapAction)
        {
            headersRequest["SOAPAction"] = soapAction
        }
        const response = await fetch(process.env.URL_SIEBEL, {
            method: "POST",
            headers: headersRequest,
            body: data,
        });
        const xml = await response.text();
        logMessage(serviceId, null, "After callSiebel", xml, "INFO");
        const json = await parser.parse(xml);
        return {
            body: json || "",
            status: response.status,
        };
    } catch (error) {
        console.log(error)
        return {
            body: "Error callSiebel: " +
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

module.exports = { callSiebel };