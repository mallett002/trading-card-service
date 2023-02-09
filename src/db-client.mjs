import DataApiClient from 'data-api-client';


let client;


const getPgClient = () => {
    if (!client) {
        try {
            client = DataApiClient({
                secretArn: '',
                resourceArn: '',
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
