import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";

import { NetworkStack } from '../stacks/network-stack';
import { DatabaseStack } from '../stacks/database-stack';
import { ApplicationStack } from '../stacks/application-stack';

export class ProductionStage extends cdk.Stage {

    constructor(scope: Construct, id: string, props?: cdk.StageProps) {
      super(scope, id, props);

      const networkStack = new NetworkStack(this, 'Network', {
        env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
      });

      const databaseStack = new DatabaseStack(this, 'Database', {
        vpc: networkStack.vpc,
        env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
      });

      const applicationStack = new ApplicationStack(this, 'App', {
        vpc: networkStack.vpc,
        certificate: networkStack.certificate,
        hostedZone: networkStack.hostedZone,
        databaseName: databaseStack.databaseName,
        dbSecret: databaseStack.dbSecret,
        clusterArn: databaseStack.clusterArn,
        env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
      });

      databaseStack.grantDatabaseAccess(applicationStack.taskRole);
    }
}