const logMessage = (
    serviceId,
    businessMsgId,
    subprocess,
    message,
    logLevel,
) => {
    log(serviceId, businessMsgId, subprocess, message, logLevel);
};
function log(serviceId, businessMsgId, subprocess, message, logLevel) {
    var type = whatIsIt(message);
    if (type === "Object") {
        message = JSON.stringify(message);
    }
    if (logLevel == "ERROR") {
        console.error(
            serviceId +
                " - " +
                subprocess +
                " - " +
                businessMsgId +
                " - " +
                message,
        );
    } else {
        console.log(
            serviceId +
                " - " +
                subprocess +
                " - " +
                businessMsgId +
                " - " +
                message,
        );
    }
    return true;
}
const stringConstructor = "test".constructor;
const arrayConstructor = [].constructor;
const objectConstructor = ({}).constructor;
function whatIsIt(object) {
    if (object === null) {
        return "null";
    }else if (object === undefined) {
        return "undefined";
    }else if (object.constructor === stringConstructor) {
        return "String";
    }else if (object.constructor === arrayConstructor) {
        return "Array";
    }else if (object.constructor === objectConstructor) {
        return "Object";
    }else if(!isNaN(parseFloat(object)) && !isNaN(object - 0)){
        return "Number";
    }else {
        return "don't know";
    }
}
module.exports = { logMessage };
