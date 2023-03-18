import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from "constructs";
import { UserPool } from "aws-cdk-lib/aws-cognito";

export class CognitoUserPool extends Construct {
    public readonly userPoolId: string;
	public readonly userPoolClientId: string;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        // Create new user pool (Directory of users for our application)
        const userPool = new UserPool(this, 'TradingCardUserPool', {
            signInAliases: { username: true, email: true },
            selfSignUpEnabled: true,
            removalPolicy: RemovalPolicy.DESTROY,
        });

        // Create the client that will interact with this userpool
        const appClient = userPool.addClient('TradingCardClient', {
            authFlows: { userPassword: true }
        });

        this.userPoolId = userPool.userPoolId;
		this.userPoolClientId = appClient.userPoolClientId;
    }

}
