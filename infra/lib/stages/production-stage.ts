import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";

import { NetworkStack } from '../stacks/network-stack';
import { DatabaseStack } from '../stacks/database-stack';
import { ApplicationStack } from '../stacks/application-stack';


export class ProductionStage extends cdk.Stage {

    constructor(scope: Construct, id: string, props?: cdk.StageProps) {
      super(scope, id, props);

      const networkStack = new NetworkStack(this, 'network', {
        env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
      });

      const databaseStack = new DatabaseStack(this, 'database', {
        vpc: networkStack.vpc,
        env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }
      });

      const applicationStack = new ApplicationStack(this, 'app', {
        vpc: networkStack.vpc,
        certificate: networkStack.certificate,
        hostedZone: networkStack.hostedZone,
        domainName: networkStack.domainName,
        databaseName: databaseStack.databaseName,
        dbSecret: databaseStack.dbSecret,
        clusterArn: databaseStack.clusterArn,
        env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
      });

      databaseStack.grantDatabaseAccess(applicationStack.taskRole);
    }
}