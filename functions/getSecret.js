const {
    SecretsManagerClient,
    GetSecretValueCommand,
} = require("@aws-sdk/client-secrets-manager");

const client = new SecretsManagerClient({
    region: process.env.REGION,
});

let response;

const getSecret = async (secret_name) => {
    try {
        response = await client.send(
            new GetSecretValueCommand({
                SecretId: secret_name,
                VersionStage: "AWSCURRENT",
            }),
        );
        let secretString = JSON.parse(response.SecretString);
        return secretString;
    } catch (error) {
        throw error;
    }
};
module.exports = { getSecret };
