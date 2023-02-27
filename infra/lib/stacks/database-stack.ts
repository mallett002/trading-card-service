import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { DbInitializer } from '../constructs/db-initializer';

interface DatabaseStackProps extends cdk.StackProps {
    vpc: ec2.Vpc;
}

export class DatabaseStack extends cdk.Stack {
    public readonly dbSecret: rds.DatabaseSecret;
    public readonly databaseName: string;
    public readonly dbCluster: rds.ServerlessCluster;
    public readonly clusterArn: string;

    constructor(scope: Construct, id: string, props: DatabaseStackProps) {
      super(scope, id, props);

      this.dbSecret = new rds.DatabaseSecret(this, 'AuroraSecret', {
        username: 'clusteradmin',
      });

      this.databaseName = 'TradingCardDb';
  
      new cdk.CfnOutput(this, 'Secret Name', { value: this.dbSecret.secretName });
      new cdk.CfnOutput(this, 'Secret ARN', { value: this.dbSecret.secretArn });
      new cdk.CfnOutput(this, 'Secret Full ARN', { value: this.dbSecret.secretFullArn || '' });

      this.dbCluster = new rds.ServerlessCluster(this, 'AuroraCluster', {
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
        parameterGroup: rds.ParameterGroup.fromParameterGroupName(this, 'ParameterGroup', 'default.aurora-postgresql10'),
        enableDataApi: true,
        engine: rds.DatabaseClusterEngine.AURORA_POSTGRESQL,
        vpc: props.vpc,
        credentials: rds.Credentials.fromSecret(this.dbSecret),
        defaultDatabaseName: this.databaseName,
      });
  
      this.clusterArn = this.dbCluster.clusterArn;

      new cdk.CfnOutput(this, 'Cluster ARN', { value: this.clusterArn });

      const dbInitialization = new DbInitializer(this, 'RdsInitializer', {
        vpc: props.vpc,
        dbSecret: this.dbSecret,
        databaseName: this.databaseName,
        clusterArn: this.clusterArn
      });

      // Todo: Create the lambda code that will create the tables (./rds-initialization/index.js)

    }

    public grantDatabaseAccess(role: iam.IRole) {
        console.log('About to grant dataApiAccess to role: ', role.roleArn);
        this.dbCluster.grantDataApiAccess(role);
    }
}