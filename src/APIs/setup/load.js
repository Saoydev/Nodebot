const path = require('path');
const fs = require('fs');

module.exports = (app) => {
    const endpointPath = path.join(__dirname, '..', 'endpoints');
    const endpoints = fs.readdirSync(endpointPath).filter(file => file.endsWith('.js'));

    endpoints.forEach(file => {
        try {
            const data = require(path.join(endpointPath, file));

            if (data.endpoint && typeof data.post === 'function') {
                app.post(`/api/${data.endpoint}`, data.post);
                console.log(`Endpoint registered: /api/${data.endpoint}`);
            }
        } catch (err) {
            console.error(`Failed to load endpoint ${file}:`, err);
        }
    });
};
