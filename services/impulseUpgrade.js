require("dotenv").config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const { callSOA } = require("../functions/callSOA");
const serviceId = "impulseUpgrade";

const impulseUpgrade = async (req) => {
    try {
        if (
            Object.keys(req).length != 4
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
            templatePath: "../requests/impulseUpgrade_request.xml",
            replacements: {
                system:req.system,
                subscriberIdentifier:req.subscriberIdentifier,
                packageId:req.packageId,
                partNumber:req.partNumber
            },
        };
        const respSiebel = await callSOA(params,serviceId,"","/Mirada/proxy/BpelProcessRequestUpgradePROXY");
        if (respSiebel.status != 200) {
            return {
                body: {
                    status: respSiebel.status,
                    detail: serviceId+" - Error SOA",
                    dataArea: "",
                }
                , status: respSiebel.status
            }
        }
        let accountInfo = respSiebel.body?.Envelope?.Body?.RequestUpgradeResponse;
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
                    detail: serviceId+" - Error al procesar la informacion de la cuenta",
                    dataArea: "",
                }
                , status: 400
            }
        }
    } catch (error) {
        return{
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
    impulseUpgrade,
};
