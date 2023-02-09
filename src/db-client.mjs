import DataApiClient from 'data-api-client';


let client;


const getPgClient = () => {
    if (!client) {
        try {
            client = DataApiClient({
                secretArn: 'arn:aws:secretsmanager:us-east-1:175849613020:secret:AuroraSecret41E6E877-Xl1leH2alD8v-1wRBti',
                resourceArn: 'arn:aws:rds:us-east-1:175849613020:cluster:tradingcardservicestack-auroracluster23d869c0-atyjp7k6w4ba',
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
