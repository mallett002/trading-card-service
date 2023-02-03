import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class TradingCardServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const vpc = new ec2.Vpc(this, 'TradingCardServiceVPC', {
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'ingress',
          subnetType: ec2.SubnetType.PUBLIC,
        }
      ]
    });

    const dbSecret = new rds.DatabaseSecret(this, 'AuroraSecret', {
      username: 'clusteradmin',
    });

    new cdk.CfnOutput(this, 'Secret Name', { value: dbSecret.secretName });
    new cdk.CfnOutput(this, 'Secret ARN', { value: dbSecret.secretArn });
    new cdk.CfnOutput(this, 'Secret Full ARN', { value: dbSecret.secretFullArn || '' });

    // Create string parameter provide other AWS services with credentials to connect to RDS:
    // const credentialsArn = new ssm.StringParameter(this, 'DBCredentialsArn', {
    //   parameterName: 'db-secret-credentials-arn',
    //   stringValue: dbSecret.secretArn,
    // });

    // get the default security group
    // const defaultSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, "SG", 'sg-fe621cf5');

    const cluster = new rds.ServerlessCluster(this, 'AuroraCluster', {
      // securityGroups: [defaultSecurityGroup],
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      parameterGroup: rds.ParameterGroup.fromParameterGroupName(this, 'ParameterGroup', 'default.aurora-postgresql10'),
      enableDataApi: true,
      engine: rds.DatabaseClusterEngine.AURORA_POSTGRESQL,
      
      vpc,
      credentials: rds.Credentials.fromSecret(dbSecret),
      defaultDatabaseName: 'TradingCardDb',
    });

    new cdk.CfnOutput(this, 'Cluster ARN', { value: cluster.clusterArn });

  }
}
