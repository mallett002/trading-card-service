import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import { ApplicationProtocol } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { AuthConstruct } from '../constructs/auth-construct';
import { ApiGateway } from '../constructs/gateway';


interface ApplicationStackProps extends cdk.StackProps {
  vpc: ec2.Vpc,
  certificate: cdk.aws_certificatemanager.Certificate;
  hostedZone: route53.IHostedZone;
  domainName: string;
  dbSecret: rds.DatabaseSecret;
  databaseName: string;
  clusterArn: string;
}

export class ApplicationStack extends cdk.Stack {
    public readonly taskRole: iam.IRole;

    constructor(scope: Construct, id: string, props: ApplicationStackProps) {
      super(scope, id, props);

      const dockerImage = new DockerImageAsset(this, 'TradingCardServiceImageAsset', {
        directory: '../'
      });
  
      // Fargate with load balancer: ----------------------------------------------------------------------------
      const ecsCluster = new ecs.Cluster(this, 'TradingCardServiceEcsCluster', {
        clusterName: 'trading-card-cluster',
        containerInsights: true,
        vpc: props.vpc,
      });
  
      const albFargate = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'TradingCardServiceLbFargateService', {
        certificate: props.certificate,
        domainZone: props.hostedZone,
        protocol: ApplicationProtocol.HTTPS,
        cluster: ecsCluster,
        desiredCount: 2,
        assignPublicIp: false,
        memoryLimitMiB: 1024,
        cpu: 512,
        healthCheckGracePeriod: cdk.Duration.seconds(60),
        maxHealthyPercent: 200,
        minHealthyPercent: 50,
        taskImageOptions: {
          image: ecs.ContainerImage.fromDockerImageAsset(dockerImage),
          containerPort: 3000,
          enableLogging: true,
          logDriver: ecs.LogDrivers.awsLogs({
            streamPrefix: id,
            logRetention: logs.RetentionDays.ONE_WEEK,
          }),
          environment: {
            SECRET_ARN: props.dbSecret.secretArn,
            CLUSTER_ARN: props.clusterArn,
            DATABASE_NAME: props.databaseName
          }
        },
        taskSubnets: {
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
        },
        loadBalancerName: 'trading-service-lb',
      });

      albFargate.targetGroup.configureHealthCheck({
        enabled: true,
        healthyThresholdCount: 3,
        path: '/health',
        interval: cdk.Duration.seconds(10),
        healthyHttpCodes: '200'
      });

      this.taskRole = albFargate.taskDefinition.taskRole;
  
      const auth = new AuthConstruct(this, 'TradingCardAuth');

      new ApiGateway(this, 'TradingCardApiGateway', {
        userPool: auth.userPool,
        userPoolClient: auth.userPoolClient,
        domainName: props.domainName,
        certificate: props.certificate,
        listener: albFargate.listener,
        hostedZone: props.hostedZone,
      });
    }
}