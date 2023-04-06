import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as integrations from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as apigwv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import { ApplicationListener } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as apiGatewayAuthorizers from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';
import * as Route53 from "aws-cdk-lib/aws-route53";
import * as Route53Targets from "aws-cdk-lib/aws-route53-targets";


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

        // create gateway domain
        const domainName = new apigwv2.DomainName(this, 'ApiGatewayDomainName', {
            domainName: props.domainName,
            certificate: props.certificate
        });

        // integrate the the load balancer with this gateway
        const albIntegration = new integrations.HttpAlbIntegration('AlbGatewayIntegration', props.listener, {
            secureServerName: props.domainName
        });

        // The gateway
        const httpApi = new apigwv2.HttpApi(this, 'HttpApiGateway', {
            defaultAuthorizationScopes: [
                'openid',
                'profile'
            ],
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
        this.applyRoutesToApi(httpApi, '/card', apigwv2.HttpMethod.POST, authorizer, albIntegration);
        this.applyRoutesToApi(httpApi, '/card/{id}', apigwv2.HttpMethod.GET, authorizer, albIntegration);
        this.applyRoutesToApi(httpApi, '/cards', apigwv2.HttpMethod.GET, authorizer, albIntegration);

        // route53 A Record --> gateway 
        new Route53.ARecord(this, 'AliasRecord', {
            zone: props.hostedZone,
            target: Route53.RecordTarget.fromAlias(
                new Route53Targets.ApiGatewayv2DomainProperties(domainName.regionalDomainName, domainName.regionalHostedZoneId)
            ),
        });
    }

    private applyRoutesToApi(
        httpApi: apigwv2.HttpApi,
        path: string,
        method: apigwv2.HttpMethod,
        authorizer: apiGatewayAuthorizers.HttpUserPoolAuthorizer,
        integration: integrations.HttpAlbIntegration
    ): void {
        httpApi.addRoutes({
            path: path,
            methods: [method],
            authorizer,
            integration
        });
    }
}