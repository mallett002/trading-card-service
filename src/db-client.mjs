import {
    SecretsManagerClient,
    GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import DataApiClient from 'data-api-client';



let client;

async function getDbSecret() {
    const secretName = "";
    const secretsClient = new SecretsManagerClient({
      region: "us-east-1",
    });
    
    let response;
    
    try {
      response = await secretsClient.send(
        new GetSecretValueCommand({ SecretId: secretName })
      );
    } catch (error) {
      // For a list of exceptions thrown, see
      // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
      throw error;
    }
    
    return response.SecretString;
}


const getPgClient = () => {
    if (!client) {
        try {
            client = DataApiClient({
                secretArn: 'arn:aws:secretsmanager:us-east-1:175849613020:secret:AuroraSecret41E6E877-GHXmTs0hpov6-vmWF2m',
                resourceArn: 'arn:aws:rds:us-east-1:175849613020:cluster:tradingcardservicestack-auroracluster23d869c0-zuw6k7lcemk7',
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
