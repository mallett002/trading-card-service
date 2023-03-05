import { Duration, Stack } from "aws-cdk-lib";
import { AwsCustomResource, AwsSdkCall, PhysicalResourceId, AwsCustomResourcePolicy } from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as iam from "aws-cdk-lib/aws-iam";

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
    public readonly lambdaInitRole: iam.Role;

    constructor(scope: Construct, id: string, props: DbInitializerProps) {
        super(scope, id);

        // Look up the stack
        const stack = Stack.of(this);

        this.lambdaInitRole = new iam.Role(this, 'LambdaInitRole', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
        });

        this.lambdaInitRole.addToPolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            resources: ["*"],
            actions: [
                "ec2:DescribeNetworkInterfaces",
                "ec2:CreateNetworkInterface",
                "ec2:DeleteNetworkInterface",
                "ec2:DescribeInstances",
                "ec2:AttachNetworkInterface"
            ]
        }));

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
            role: this.lambdaInitRole
        });

        // onUpdate AwsCustomResource, will do this call:
        const sdkCall: AwsSdkCall = {
            service: 'Lambda',
            action: 'invoke',
            parameters: { FunctionName: rdsInitLambda.functionName },
            physicalResourceId: PhysicalResourceId.of(`${id}-AwsSdkCall-${rdsInitLambda.currentVersion.version}`)
        };

        // Role to be assumed by the AwsCustomResource backed lambda that gets created
        const customResourceFnRole = new iam.Role(this, 'AwsCustomResourceRole', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
        });

        // allow the lambda to be called
        customResourceFnRole.addToPolicy(new iam.PolicyStatement({
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