const DataApiClient = require('data-api-client');

const createTablesQuery = `
CREATE TABLE CARD (
    ID                      SERIAL PRIMARY KEY,
    BRAND                   VARCHAR(50) NOT NULL,
    CARD_NUMBER             INT,
    LAST                    VARCHAR(20),
    FIRST                   VARCHAR(20)
);`;

exports.handler = async (event) => {
    console.log({event});
    console.log({env: {
        secretArn: process.env.SECRET_ARN,
        resourceArn: process.env.CLUSTER_ARN,
        database: process.env.DATABASE_NAME
    }});

    try {
        console.log('Connecting to database for sql table init...')
        const client = DataApiClient({
            secretArn: process.env.SECRET_ARN || '',
            resourceArn: process.env.CLUSTER_ARN || '',
            database: process.env.DATABASE_NAME || '',
            region: 'us-east-1',
            engine: 'pg'
        });

        console.log('client connected to database');

        const result = await client.query(createTablesQuery);

        return {
            status: 'OK',
            results: result.records[0]
        }
    } catch (err) {
        console.log('Error connecting to database: ', err);
    }

};
