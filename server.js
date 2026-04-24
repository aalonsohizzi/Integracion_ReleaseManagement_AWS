require("dotenv").config();
const randtoken = require("rand-token");
const express = require("express");
const server = express();
const jwt = require("jsonwebtoken");
const cors = require("cors");

server.use(cors());
server.use((req, res, next) => {
    if (Buffer.isBuffer(req.body)) {
        req.body = req.body.toString('utf8');
    }
    if (typeof req.body === 'string') {
        try {
            req.body = JSON.parse(req.body);
        } catch (e) {
        }
    }
    next();
});
server.use(express.urlencoded({ extended: true, strict: false }));
server.use(express.json());

const accessTokenSecret = process.env.HASH;
const protectedMethod = express.Router();
var refreshTokens = {};

const { logMessage } = require("./functions/logMessage");
const { getInfoAccount } = require("./services/getInfoAccount");
const { addonsByAccount } = require("./services/addonsByAccount");
const { impulseUpgrade } = require("./services/impulseUpgrade");
const { getPendingOrders } = require("./services/getPendingOrders");
const { getUser } = require("./functions/getAuthorization");

protectedMethod.use((req, res, next) => {
    console.log(req.headers);
    let token = req.headers["authorization"];

    if (token) {
        token = token.replace("Bearer ", "");
        jwt.verify(token, accessTokenSecret, (err, decoded) => {
            if (err) {
                if (err.message == "jwt expired") {
                    res.status(401);
                    res.send("Unauthorized");
                } else {
                    return res
                        .json({
                            status: 400,
                            detail: "Token inválido",
                        })
                        .status(200);
                }
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        res.send({
            status: 400,
            detail: "Token inexistente",
        }).status(200);
    }
});

server.post("/auth", (req, res) => {
    const { username, password } = req.body;
    const respUser = getUser(username, password)
        .then((respUser) => {
            try {
                if (respUser) {
                    const payload = {
                        username: username,
                        role: "admin",
                    };
                    var jwt = require("jsonwebtoken");
                    const accessToken = jwt.sign(payload, accessTokenSecret, {
                        expiresIn: 3600,
                    });
                    let refreshToken = randtoken.uid(256);
                    refreshTokens[refreshToken] = username;
                    res.json({
                        status: 200,
                        detail: "Succcess",
                        token: "Bearer " + accessToken,
                        refreshToken: refreshToken,
                        expires: 3600000,
                    }).status(200);
                } else {
                    res.json({
                        status: 400,
                        detail: "Usuario o password no valido",
                    }).status(200);
                }
            } catch (e) {
                res.json({
                    status: 400,
                    detail: e.message,
                }).status(200);
            }
        })
        .catch((error) => {
            res.json({
                status: 400,
                detail: error.message,
            }).status(200);
        });
});

server.post("/token", function (req, res, next) {
    let username = req.body.username;
    let refreshToken = req.body.refreshToken;
    if (
        refreshToken in refreshTokens &&
        refreshTokens[refreshToken] == username
    ) {
        let user = {
            username: username,
            role: "admin",
        };
        let token = jwt.sign(user, accessTokenSecret, { expiresIn: 3600 });
        res.json({ token: "Bearer " + token }).status(200);
    } else {
        res.send(401);
    }
});

server.post("/token/reject", function (req, res, next) {
    let refreshToken = req.body.refreshToken;
    if (refreshToken in refreshTokens) {
        delete refreshTokens[refreshToken];
    }
    res.send(204);
});

server.post('/getInfoAccount', (request, response) => {
    logMessage("getInfoAccount", null, "Initial request", JSON.stringify(request.body), "INFO");
    getInfoAccount(request.body).then(data => {
        logMessage("getInfoAccount", null, "Final response", JSON.stringify(data.body), "INFO");
        response.status(data.status).json(data.body)
    })
})

server.post("/getPendingOrders", (request, response) => {
    logMessage("getPendingOrders", null, "Initial request", JSON.stringify(request.body), "INFO");
    getPendingOrders(request.body).then(data => {
        logMessage("getPendingOrders", null, "Final response", JSON.stringify(data.body), "INFO");
        response.status(data.status).json(data.body)
    })
});

server.post('/addonsByAccount', (request, response) => {
    logMessage("addonsByAccount", null, "Initial request", JSON.stringify(request.body), "INFO");
    addonsByAccount(request.body).then(data => {
        logMessage("addonsByAccount", null, "Final response", JSON.stringify(data.body), "INFO");
        response.status(data.status).json(data.body)
    })
});

server.post('/impulseUpgrade', (request, response) => {
    logMessage("impulseUpgrade", null, "Initial request", JSON.stringify(request.body), "INFO");
    impulseUpgrade(request.body).then(data => {
        logMessage("impulseUpgrade", null, "Final response", JSON.stringify(data.body), "INFO");
        response.status(data.status).json(data.body)
    })
})

module.exports = server;
