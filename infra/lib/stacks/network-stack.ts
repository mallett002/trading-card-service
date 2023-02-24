import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

import { DNSConstruct } from '../constructs/dns';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import * as route53 from 'aws-cdk-lib/aws-route53';

export class NetworkStack extends cdk.Stack {
    public readonly vpc: Vpc;
    public readonly certificate: cdk.aws_certificatemanager.Certificate;
    public readonly hostedZone: route53.IHostedZone;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);

      this.vpc = new ec2.Vpc(this, 'TradingCardServiceVPC', {
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

      this.certificate = dns.certificate;
      this.hostedZone = dns.hostedZone;
    }
}