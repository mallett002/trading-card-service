const {handler} = require('../index.js');

describe('index.js', () => {
    beforeAll(() => {
        process.env.SECRET_NAME = '';
    });

    it('should work', async () => {
        const response = await handler();

        expect(response.status).toBe(200);
    }, 100000);
});