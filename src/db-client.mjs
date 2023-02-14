import DataApiClient from 'data-api-client';


let client;


/*
CREATE TABLE CARD (
    ID                      SERIAL PRIMARY KEY,
    BRAND                   VARCHAR(50) NOT NULL,
    CARD_NUMBER             INT,
    LAST                    VARCHAR(20),
    FIRST                   VARCHAR(20)
);
*/
const getPgClient = () => {
    if (!client) {
        try {
            client = DataApiClient({
                secretArn: process.env.SECRET_ARN || '',
                resourceArn: process.env.CLUSTER_ARN || '',
                database: 'TradingCardDb',
                region: 'us-east-1',
                engine: 'pg'
            });
        } catch (err) {
            console.log('Error connecting to database: ', err);
        }
    }

    return client;
};

export default getPgClient;
