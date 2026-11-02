function log(environment) {
    if (environment === 'development') {
        return (msg) => {
            console.log(`[${new Date().toISOString()}] ${msg}`);
        }
    }
    return (msg) => {
    }
}

module.exports = log;


