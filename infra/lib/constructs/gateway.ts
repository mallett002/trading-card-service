import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as apigw from 'aws-cdk-lib/aws-apigateway';

interface GatewayProps {
    userPool: cognito.UserPool
}

export class RestApiGateway extends Construct {
    public readonly userPoolId: string;
    public readonly userPoolClientId: string;

    constructor(scope: Construct, id: string, props: GatewayProps) {
        super(scope, id);

        const api = new apigw.RestApi(this, 'TradingCardGateway', {
            endpointTypes: [apigw.EndpointType.REGIONAL],
            deploy: true,
            deployOptions: {
                stageName: 'prod',
            },
            defaultCorsPreflightOptions: {
                allowOrigins: apigw.Cors.ALL_ORIGINS,
                allowMethods: apigw.Cors.ALL_METHODS,
            },
        });

        const authorizer = new apigw.CognitoUserPoolsAuthorizer(this, 'TradingCardAuthorizer', {
            cognitoUserPools: [props.userPool]
        });

        const cardResource = api.root.addResource('card');

        cardResource.addMethod(
            'GET',
            new apigw.MockIntegration({
                integrationResponses: [{
                    statusCode: '200',
                    responseTemplates: {
                        'application/json': JSON.stringify({
                            statusCode: 200,
                            message: 'Hello From Protected Resource',
                        }),
                    },
                    responseParameters: {
                        'method.response.header.Content-Type': "'application/json'",
                        'method.response.header.Access-Control-Allow-Origin': "'*'",
                    },
                }],
                requestTemplates: {
                    'application/json': "{ 'statusCode': 200 }",
                },
            }),
            {
                methodResponses: [{
                    statusCode: '200',
                    responseParameters: {
                        'method.response.header.Content-Type': true,
                        'method.response.header.Access-Control-Allow-Origin': true,
                    },
                }],
                authorizer: authorizer,
                authorizationType: apigw.AuthorizationType.COGNITO,
                authorizationScopes: ['tradingcardservice-resource-server/tradingcardservice.write'],
        },
        );

    }
}