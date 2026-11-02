const {randomUUID} = require('crypto');
const {isValidUuid} = require('../../validation/uuid');

describe('isValidUuid', function () {
    it('returns true for a new uuid', function () {
        expect(isValidUuid(randomUUID())).toBe(true);
    });

    it('returns true for a uuid in capitals', function () {
        expect(isValidUuid('3F2B8C1E-9A4D-4E2F-B1C3-7D8E9F0A1B2C')).toBe(true);
    });

    test.each([
        [''],
        ['12'],
        ['61a9079ed842a2429ae53d82'],
        ['3f2b8c1e-9a4d-4e2f-b1c3-7d8e9f0a1b2'],
        ['3f2b8c1e9a4d4e2fb1c37d8e9f0a1b2c'],
        [12],
        [null],
        [undefined]
    ])('returns false for %p', function (id) {
        expect(isValidUuid(id)).toBe(false);
    });
});
