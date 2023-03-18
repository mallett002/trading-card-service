import DataApiClient from 'data-api-client';
import {createTablesSql} from './sql/create-tables';

exports.handler = async (event) => {
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

        const result = await client.query(createTablesSql);

        return {
            status: 'OK',
            results: result.records[0]
        }
    } catch (err) {
        console.log('Error connecting to database: ', err);
    }

};


// ------------ Attempting to use flyway: -------------------
// const {SecretsManagerClient, GetSecretValueCommand} = require('@aws-sdk/client-secrets-manager');
// const { Flyway } = require("node-flyway");

// const client = new SecretsManagerClient({
//     region: "us-east-1",
// });

// exports.handler = async () => {
//     const {username, password, host} = await getDBSecret();
    
//     try {

//         // The connection to DB is failing
//         const flyway = new Flyway({
//             url: `jdbc:postgresql://${host}/${username};databaseName=TradingCardDb;`,
//             user: username,
//             password,
//             defaultSchema: "public",
//             migrationLocations: ["sql"]
//         });

//         const response = await flyway.migrate();

//         if (!response || !response.success) {
//             return {
//                 success: false,
//                 status: 500,
//                 message: response.error.message
//             }
//         }

//     } catch (error) {
//         console.log(error);

//         throw error;
//     }

//     return {
//         datas: {username, host},
//         success: true,
//         status: 200
//     };
// };

// async function getDBSecret() {
//     const secret_name = process.env.SECRET_NAME;

//     let response;

//     try {
        
//         response = await client.send( new GetSecretValueCommand({ SecretId: secret_name }) );

//         const secretValues = JSON.parse(response.SecretString);

//         return secretValues;
//     } catch (error) {
//         console.log('error retreiving secret...', {error});

//         throw error;
//     }
// }