import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";

export class AuthConstruct extends Construct {
    public readonly userPoolId: string;
    public readonly userPoolClientId: string;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        // Create new user pool (Directory of users for our application)
        const userPool = new cognito.UserPool(this, 'TradingCardUserPool', {
            signInAliases: { username: true, email: true },
            selfSignUpEnabled: true,
            removalPolicy: RemovalPolicy.DESTROY,
            autoVerify: { email: true }
        });


        // Sign in with amazon:
        // const amazonProvider = new cognito.UserPoolIdentityProviderAmazon(this, 'Amazon', {
        //     userPool,
        //     clientId: 'amzn-client-id',
        //     clientSecret: 'amzn-client-secret',
        // });

        // Create the app client that will interact with this userpool
        const appClient = userPool.addClient('TradingCardClient', {
            authFlows: { userPassword: true },
            oAuth: {
                flows: {
                    authorizationCodeGrant: true,
                    implicitCodeGrant: true
                },
                //    callbackUrls: [''],
                //    logoutUrls: ['']
            }
            // if want signin with amazon:
            // supportedIdentityProviders: [
            //     cognito.UserPoolClientIdentityProvider.AMAZON,
            // ],
        });


        // appClient.node.addDependency(amazonProvider);

        this.userPoolId = userPool.userPoolId;
        this.userPoolClientId = appClient.userPoolClientId;
    }

}
