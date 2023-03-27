import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";


export class AuthConstruct extends Construct {
    public readonly userPool: cognito.UserPool;
    public readonly userPoolClientId: string;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        // Create new user pool (Directory of users for our application)
        this.userPool = new cognito.UserPool(this, 'TradingCardUserPool', {
            signInAliases: { username: true, email: true },
            selfSignUpEnabled: true,
            removalPolicy: RemovalPolicy.DESTROY,
            autoVerify: { email: true },
            userVerification: {
                emailSubject: 'Verify Email',
                emailBody: 'Thanks for signing up! Your verification code is {####}',
                emailStyle: cognito.VerificationEmailStyle.CODE,
            },
            accountRecovery: cognito.AccountRecovery.EMAIL_ONLY
        });

        // Create a scope for the token to be able to access things on our API
        const cardUserScope = new cognito.ResourceServerScope({
            scopeName: 'tradingcardservice.write',
            scopeDescription: 'tradingcardservice write scope for users',
        });

        // The resource server that gets added to the app client has the scope created above
        const resourceServer = new cognito.UserPoolResourceServer(this, 'tradingcardservice-resource-server', {
            identifier: 'tradingcardservice-resource-server',
            userPool: this.userPool,
            scopes: [cardUserScope],
        });

        // Create the app client that will interact with this userpool
        const appClient = this.userPool.addClient('TradingCardClient', {
            authFlows: { userPassword: true },
            oAuth: {
                flows: {
                    authorizationCodeGrant: true,
                    implicitCodeGrant: true
                },
                scopes: [
                    cognito.OAuthScope.OPENID,
                    cognito.OAuthScope.resourceServer(resourceServer, cardUserScope) 
                ],
                callbackUrls: ['https://williamalanmallett.link'],
                logoutUrls: ['https://williamalanmallett.link']
            }
        });

        const domain = this.userPool.addDomain("CognitoDomain", {
            cognitoDomain: {
                domainPrefix: "williamalanmallet",
            },
        });
    }

}
