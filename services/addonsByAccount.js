require("dotenv").config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const { callSiebel } = require("../functions/callSiebel");
const serviceId = "addonsByAccount";

const addonsByAccount = async (req) => {
    try {
        if (
            Object.keys(req).length == 0 ||
            !req.accountName ||
            req.accountName.length == 0
        ) {
            return {
                body: {
                    status: 400,
                    detail: "'Ingrese los parametros requeridos",
                    dataArea: "",
                }
                , status: 400
            }
        }
        const params = {
            templatePath: "../requests/addonsByAccount_request.xml",
            replacements: {
                AccountName: req.accountName,
            },
        };
        const respSiebel = await callSiebel(params, serviceId, '"document/http://siebel.com/CustomUI:TT_spcProduct_spcCatalog_spcAddOns_spcWF"');
        if (respSiebel.status != 200) {
            return {
                body: {
                    status: respSiebel.status,
                    detail: serviceId + " - Error Siebel",
                    dataArea: "",
                }
                , status: respSiebel.status
            }
        }
        const accountInfo =  respSiebel.body?.Envelope?.Body?.TT_spcProduct_spcCatalog_spcAddOns_spcWF_Output?.MapResponse?.ListOfCategory || "";
        if (accountInfo != null && accountInfo != undefined) {
            return {
                body: {
                    status: 200,
                    detail: serviceId,
                    dataArea: accountInfo,
                }
                , status: 200
            }
        } else {
            return {
                body: {
                    status: 400,
                    detail: serviceId + " - Error al procesar la informacion de la cuenta",
                    dataArea: "",
                }
                , status: 400
            }
        }
    } catch (error) {
        console.log(error)
        return {
            body: {
                status: 500,
                detail: serviceId + " - Error al consultar la cuenta.",
                dataArea: "",
            }
            , status: 500
        }
    }
};

module.exports = {
    addonsByAccount,
};
