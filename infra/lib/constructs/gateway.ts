import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as integrations from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as apigwv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import { ApplicationListener } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as apiGatewayAuthorizers from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';

interface GatewayProps {
    userPool: cognito.UserPool,
    domainName: string;
    certificate: cdk.aws_certificatemanager.Certificate;
    listener: ApplicationListener;
    userPoolClient: cognito.UserPoolClient;
}

export class ApiGateway extends Construct {
    public readonly userPoolId: string;
    public readonly userPoolClientId: string;

    constructor(scope: Construct, id: string, props: GatewayProps) {
        super(scope, id);

        // const authorizer = new apigw.CognitoUserPoolsAuthorizer(this, 'TradingCardAuthorizer', {
        //     cognitoUserPools: [props.userPool],
        // });

        // // create domain
        const domainName = new apigwv2.DomainName(this, 'ApiGatewayDomainName', {
            domainName: props.domainName,
            certificate: props.certificate
        });

        // // integration is the load balancer
        const albIntegration = new integrations.HttpAlbIntegration('AlbGatewayIntegration', props.listener, {
            // secureServerName: props.domainName (need this?)
            // vpcLink need this??
        });


        const httpApi = new apigwv2.HttpApi(this, 'HttpApiGateway', {
            defaultAuthorizationScopes: ['tradingcardservice-resource-server/tradingcardservice.write', 'openid', 'profile'],
            // defaultAuthorizer: authorizer,
            defaultIntegration: albIntegration,
            defaultDomainMapping: {
                domainName: domainName
            }
        });

        const authorizer = new apiGatewayAuthorizers.HttpUserPoolAuthorizer(
            'user-pool-authorizer',
            props.userPool,
            {
                userPoolClients: [props.userPoolClient],
                // identitySource: ['$request.header.Authorization'],
            },
        );

        httpApi.addRoutes({
            path: '/{proxy+}',
            methods: [apigwv2.HttpMethod.ANY],
            authorizer: authorizer,
            integration: albIntegration
        });


        // const httpAuthorizer = new apigwv2.HttpAuthorizer(this, 'MyHttpAuthorizer', {
        //     httpApi: httpApi,
        //     identitySource: ['identitySource'],
        //     type: apigwv2.HttpAuthorizerType.JWT,

        //     // the properties below are optional
        //     authorizerName: 'authorizerName',
        //     authorizerUri: 'authorizerUri',
        //     enableSimpleResponses: false,
        //     jwtAudience: ['jwtAudience'],
        //     jwtIssuer: 'jwtIssuer',
        //     payloadFormatVersion: apigwv2.AuthorizerPayloadVersion.VERSION_1_0,
        //     resultsCacheTtl: cdk.Duration.minutes(30),
        // });
    }
}