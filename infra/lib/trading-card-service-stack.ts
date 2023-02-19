import * as cdk from 'aws-cdk-lib';
import * as path from 'path';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as logs from 'aws-cdk-lib/aws-logs';
import { DockerImageAsset, NetworkMode } from 'aws-cdk-lib/aws-ecr-assets';
import * as sm from 'aws-cdk-lib/aws-secretsmanager';

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
      cluster: ecsCluster,
      desiredCount: 2,
      assignPublicIp: true,
      // securityGroups: [],
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
  }
}
