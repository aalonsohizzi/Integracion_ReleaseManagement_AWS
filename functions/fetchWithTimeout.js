const fetchWithTimeout = (url, options, timeout = 30000) => {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(
                () =>
                    reject(
                        new Error("Timeout de 30 segundos espeando al fecth"),
                    ),
                timeout,
            ),
        ),
    ]);
};

module.exports = { fetchWithTimeout };
