import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as Route53 from "aws-cdk-lib/aws-route53";
import * as Route53Targets from "aws-cdk-lib/aws-route53-targets";

import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import { DNSConstruct } from './constructs/dns';
import { ApplicationProtocol, SslPolicy } from 'aws-cdk-lib/aws-elasticloadbalancingv2';

// Todo:
//  - Add logging to the load balancer
//  - Add cloudfront distribution?
//  - Authentication
//  - API Gateway?
//  - db read replica in other AZ

export class TradingCardServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'TradingCardServiceVPC', {
      // Subnets for each availiability zone:
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'ingress',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'application',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        }
      ],
      maxAzs: 2
    });

    const dns = new DNSConstruct(this, 'DNSConstruct');

    // Database: ----------------------------------------------------------------------------------------------
    const dbSecret = new rds.DatabaseSecret(this, 'AuroraSecret', {
      username: 'clusteradmin',
    });
    const DATABASE_NAME = 'TradingCardDb';

    new cdk.CfnOutput(this, 'Secret Name', { value: dbSecret.secretName });
    new cdk.CfnOutput(this, 'Secret ARN', { value: dbSecret.secretArn });
    new cdk.CfnOutput(this, 'Secret Full ARN', { value: dbSecret.secretFullArn || '' });

    const dbcluster = new rds.ServerlessCluster(this, 'AuroraCluster', {
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      parameterGroup: rds.ParameterGroup.fromParameterGroupName(this, 'ParameterGroup', 'default.aurora-postgresql10'),
      enableDataApi: true,
      engine: rds.DatabaseClusterEngine.AURORA_POSTGRESQL,
      vpc,
      credentials: rds.Credentials.fromSecret(dbSecret),
      defaultDatabaseName: DATABASE_NAME,
    });

    new cdk.CfnOutput(this, 'Cluster ARN', { value: dbcluster.clusterArn });

    // Docker image uploaded to ECR ---------------------------------------------------------------------------
    const dockerImage = new DockerImageAsset(this, 'TradingCardServiceImageAsset', {
      directory: '../'
    });

    // Fargate with load balancer: ----------------------------------------------------------------------------
    const ecsCluster = new ecs.Cluster(this, 'TradingCardServiceEcsCluster', {
      clusterName: 'trading-card-cluster',
      containerInsights: true,
      vpc,
    });

    const loadBalancedFargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'TradingCardServiceLbFargateService', {
      certificate: dns.certificate,
      domainZone: dns.hostedZone,
      protocol: ApplicationProtocol.HTTPS,
      cluster: ecsCluster,
      desiredCount: 2,
      assignPublicIp: true,
      taskImageOptions: {
        image: ecs.ContainerImage.fromDockerImageAsset(dockerImage),
        containerPort: 3000,
        enableLogging: true,
        logDriver: ecs.LogDrivers.awsLogs({
          streamPrefix: id,
          logRetention: logs.RetentionDays.ONE_WEEK,
        }),
        environment: {
          SECRET_ARN: dbSecret.secretArn,
          CLUSTER_ARN: dbcluster.clusterArn,
          DATABASE_NAME: DATABASE_NAME
        }
      },
      taskSubnets: {
        subnetType: ec2.SubnetType.PUBLIC
      },
      loadBalancerName: 'trading-service-lb',
    });


    // Give Fargate tasks permission to access the database:
    dbcluster.grantDataApiAccess(loadBalancedFargateService.taskDefinition.taskRole);

    // Create ARecord that routes williamalanmallet.link to the load balancer
    new Route53.ARecord(this, 'AliasRecord', {
      zone: dns.hostedZone,
      target: Route53.RecordTarget.fromAlias(
        new Route53Targets.LoadBalancerTarget(loadBalancedFargateService.loadBalancer),
      ),
    });
  }
}
