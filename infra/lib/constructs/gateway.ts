import * as cdk from 'aws-cdk-lib';
import { RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as integrations from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as apigwv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import { ApplicationListener } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as apiGatewayAuthorizers from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';
import * as Route53 from "aws-cdk-lib/aws-route53";
import * as Route53Targets from "aws-cdk-lib/aws-route53-targets";
import { IDomainName } from '@aws-cdk/aws-apigatewayv2-alpha';


interface GatewayProps {
    userPool: cognito.UserPool,
    domainName: string;
    certificate: cdk.aws_certificatemanager.Certificate;
    listener: ApplicationListener;
    userPoolClient: cognito.UserPoolClient;
    hostedZone: Route53.IHostedZone;
}

export class ApiGateway extends Construct {
    public readonly userPoolId: string;
    public readonly userPoolClientId: string;

    constructor(scope: Construct, id: string, props: GatewayProps) {
        super(scope, id);

        // V2:----------------------------------------------------------------------------------------------------------------
        // create gateway domain
        const domainName = new apigwv2.DomainName(this, 'ApiGatewayDomainName', {
            domainName: props.domainName,
            certificate: props.certificate
        });

        // integrate the the load balancer with this gateway
        const albIntegration = new integrations.HttpAlbIntegration('AlbGatewayIntegration', props.listener, {
            secureServerName: props.domainName
            // vpcLink need this??
        });

        // The gateway
        const httpApi = new apigwv2.HttpApi(this, 'HttpApiGateway', {
            defaultAuthorizationScopes: ['tradingcardservice-resource-server/tradingcardservice.write', 'openid', 'profile'],
            // defaultAuthorizer: authorizer,
            defaultIntegration: albIntegration,
            defaultDomainMapping: {
                domainName: domainName
            }
        });

        // authorizer on the gateway
        const authorizer = new apiGatewayAuthorizers.HttpUserPoolAuthorizer(
            'user-pool-authorizer',
            props.userPool,
            {
                userPoolClients: [props.userPoolClient],
                identitySource: ['$request.header.Authorization'],
            },
        );

        // authorized routes
        // Getting Forbidden with token. Something with scopes?
        httpApi.addRoutes({
            path: '/card',
            methods: [apigwv2.HttpMethod.GET, apigwv2.HttpMethod.POST],
            authorizer: authorizer,
            integration: albIntegration
        });

        // route53 A Record --> gateway
        new Route53.ARecord(this, 'AliasRecord', {
            zone: props.hostedZone,
            target: Route53.RecordTarget.fromAlias(
                new Route53Targets.ApiGatewayv2DomainProperties(domainName.regionalDomainName, domainName.regionalHostedZoneId)
            ),
        });


        // v1:-----------------------------------------------------------------------------------------------------------
        // const cognitoAuth = new apigw.CognitoUserPoolsAuthorizer(this, 'TradingCardAuthorizer', {
        //     cognitoUserPools: [props.userPool],
        // });

        // // RestApi:
        // const api = new apigw.RestApi(this, 'myApi', {
        //     defaultCorsPreflightOptions: {
        //         allowOrigins: apigw.Cors.ALL_ORIGINS,
        //         allowMethods: apigw.Cors.ALL_METHODS, // this is also the default
        //     },
        //     defaultIntegration: new apigw.Integration({
        //         type: 
        //     }),
        //     deploy: true
        // });

        // const cardEndpoint = api.root.addResource('card');

        // const integration = new integrations.HttpAlbIntegration('GatewayToAlb', props.listener, {
        //     secureServerName: props.domainName,
        //     // vpcLink need this??
        // });

        // cardEndpoint.addMethod('GET', integration, {
        //     authorizer: cognitoAuth
        // });


        /* Todo:
            - make load balancer private so forced to use apigateway
            - make sure the /health endpoint doesn't have auth around it
        */
    }
}