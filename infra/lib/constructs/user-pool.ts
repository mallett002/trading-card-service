import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { Domain } from 'domain';

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
                // Todo: figure what these need to be:
                callbackUrls: [''],
                logoutUrls: ['']

            }
            // if want signin with amazon:
            // supportedIdentityProviders: [
            //     cognito.UserPoolClientIdentityProvider.AMAZON,
            // ],
        });

        // Todo create hosted ui:
        // const certificateArn = 'arn:aws:acm:us-east-1:123456789012:certificate/11-3336f1-44483d-adc7-9cd375c5169d';

        // const domainCert = certificatemanager.Certificate.fromCertificateArn(this, 'domainCert', certificateArn);
        // userPool.addDomain('CustomDomain', {
        //     customDomain: {
        //         domainName: 'user.myapp.com',
        //         certificate: domainCert,
        //     },
        // });


        // appClient.node.addDependency(amazonProvider);

        this.userPoolId = userPool.userPoolId;
        this.userPoolClientId = appClient.userPoolClientId;
    }

}
