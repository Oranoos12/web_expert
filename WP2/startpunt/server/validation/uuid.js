// een uuid ziet er zo uit: 3f2b8c1e-9a4d-4e2f-b1c3-7d8e9f0a1b2c
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(id) {
    if (typeof id !== 'string') {
        return false;
    }
    return uuidRegex.test(id);
}

module.exports = {isValidUuid};
