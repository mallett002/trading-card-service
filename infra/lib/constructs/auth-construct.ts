import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";


export class AuthConstruct extends Construct {
    public readonly userPool: cognito.UserPool;
    public readonly userPoolClientId: string;
    public readonly userPoolClient: cognito.UserPoolClient;

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


        // Create the app client that will interact with this userpool
        this.userPoolClient = this.userPool.addClient('TradingCardClient', {
            authFlows: { userPassword: true },
            oAuth: {
                flows: {
                    authorizationCodeGrant: true,
                    implicitCodeGrant: true
                },
                scopes: [
                    cognito.OAuthScope.OPENID,
                    cognito.OAuthScope.PROFILE,
                ],
                callbackUrls: ['https://williamalanmallett.link'],
                logoutUrls: ['https://williamalanmallett.link']
            }
        });

        // Add a domain for the hosted UI for signup/signin
        this.userPool.addDomain("CognitoDomain", {
            cognitoDomain: {
                domainPrefix: "williamalanmallett",
            },
        });
    }

}
