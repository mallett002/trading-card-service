const {SecretsManagerClient, GetSecretValueCommand} = require('@aws-sdk/client-secrets-manager');


// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html
  
// const secret_name = "AuroraSecret41E6E877-CbZH3denlA9j";

  
const client = new SecretsManagerClient({
    region: "us-east-1",
});

exports.handler = async (event) => {
    // get the creds & call the flyway config function
    const {username, password} = await getDBSecret();
    



};

async function getDBSecret() {
    // const secret_name = process.env.SECRET_NAME;

    // let response;

    // try {
        
    //     response = await client.send( new GetSecretValueCommand({ SecretId: secret_name }) );

    // } catch (error) {
    //     // For a list of exceptions thrown, see
    //     // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
    //     throw error;
    // }

    // const secret = response.SecretString;

    return {password:"DX.YxH5czhO8sZChr99MblrbjvadGS", username:"clusteradmin"};
}




// exports.handler = async (event) => {
//     console.log({event});
//     console.log({env: {
//         secretArn: process.env.SECRET_ARN,
//         resourceArn: process.env.CLUSTER_ARN,
//         database: process.env.DATABASE_NAME
//     }});

//     try {
//         console.log('Connecting to database for sql table init...')
//         const client = DataApiClient({
//             secretArn: process.env.SECRET_ARN || '',
//             resourceArn: process.env.CLUSTER_ARN || '',
//             database: process.env.DATABASE_NAME || '',
//             region: 'us-east-1',
//             engine: 'pg'
//         });

//         console.log('client connected to database');

//         const result = await client.query(createTablesQuery);

//         return {
//             status: 'OK',
//             results: result.records[0]
//         }
//     } catch (err) {
//         console.log('Error connecting to database: ', err);
//     }

// };
