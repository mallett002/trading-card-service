import { Duration, Stack } from "aws-cdk-lib";
import { AwsCustomResource, AwsSdkCall, PhysicalResourceId, AwsCustomResourcePolicy } from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { PolicyDocument, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";

export interface DbInitializerProps {
    vpc: ec2.Vpc
    dbSecret: rds.DatabaseSecret;
    databaseName: string;
    clusterArn: string;
}

export class DbInitializer extends Construct {

    public readonly response: string;
    public readonly customResource: AwsCustomResource;
    public readonly function: lambda.Function;

    constructor(scope: Construct, id: string, props: DbInitializerProps) {
        super(scope, id);

        // Look up the stack
        const stack = Stack.of(this);

        // make new SG for the lambda
        const lambdaSg = new ec2.SecurityGroup(this, 'DbInitLambdaSG', {
            securityGroupName: `${id}DbInitLambdaSG`,
            vpc: props.vpc,
            allowAllOutbound: true
        });

        // Create a lambda that will create tables when called
        const rdsInitLambda = new NodejsFunction(this, 'DbInitLambda', {
            vpc: props.vpc,
            entry: './rds-initialization/index.js',
            runtime: lambda.Runtime.NODEJS_18_X,
            environment: {
                SECRET_ARN: props.dbSecret.secretArn,
                CLUSTER_ARN: props.clusterArn,
                DATABASE_NAME: props.databaseName
            },
            functionName: `${id}-RDSInit${stack.stackName}`,
            vpcSubnets: props.vpc.selectSubnets({ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }),
            allowAllOutbound: true,
            bundling: {
                externalModules: ['data-api-client']
            }
        });

        // onUpdate AwsCustomResource, will do this call:
        const sdkCall: AwsSdkCall = {
            service: 'Lambda',
            action: 'invoke',
            parameters: { FunctionName: rdsInitLambda.functionName },
            physicalResourceId: PhysicalResourceId.of(`${id}-AwsSdkCall-${rdsInitLambda.currentVersion.version}`)
        };

        // Role to be assumed by the AwsCustomResource
        const customResourceFnRole = new Role(this, 'AwsCustomResourceRole', {
            assumedBy: new ServicePrincipal('lambda.amazonaws.com')
        });

        // allow the lambda to be called
        customResourceFnRole.addToPolicy(new PolicyStatement({
            resources: [`arn:aws:lambda:${stack.region}:${stack.account}:function:*-RDSInit${stack.stackName}`],
            actions: ['lambda:InvokeFunction']
        }));

        // Create the customResource
        this.customResource = new AwsCustomResource(this, 'AwsCustomResource', {
            policy: AwsCustomResourcePolicy.fromSdkCalls({ resources: AwsCustomResourcePolicy.ANY_RESOURCE }),
            onUpdate: sdkCall,
            timeout: Duration.minutes(10),
            role: customResourceFnRole
        });

        this.response = this.customResource.getResponseField('Payload');
        this.function = rdsInitLambda;
    }
}