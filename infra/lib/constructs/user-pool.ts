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
            autoVerify: { email: true },
            userVerification: {
                emailSubject: 'Verify Email',
                emailBody: 'Thanks for signing up! Your verification code is {####}',
                emailStyle: cognito.VerificationEmailStyle.CODE,
            },
            accountRecovery: cognito.AccountRecovery.EMAIL_ONLY
        });


        // Create the app client that will interact with this userpool
        const appClient = userPool.addClient('TradingCardClient', {
            authFlows: { userPassword: true },
            oAuth: {
                flows: {
                    authorizationCodeGrant: true,
                    implicitCodeGrant: true
                },
                scopes: [cognito.OAuthScope.OPENID],
                callbackUrls: ['https://williamalanmallett.link'],
                logoutUrls: ['https://williamalanmallett.link']
            }
        });

        const domain = userPool.addDomain("CognitoDomain", {
            cognitoDomain: {
                domainPrefix: "williamalanmallet",
            },
        });

        // todo: user pool authorizer & gateway: http://buraktas.com/oauth-authorization-code-flow-aws-cdk/


        this.userPoolId = userPool.userPoolId;
        this.userPoolClientId = appClient.userPoolClientId;
    }

}
