import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';

interface DNSProps {
  domainName: string;
}

export class DNSConstruct extends Construct {
  public readonly certificate: cdk.aws_certificatemanager.Certificate;
  public readonly hostedZone: route53.IHostedZone;
  

  constructor(scope: Construct, id: string, props: DNSProps) {
    super(scope, id);

    this.hostedZone = route53.HostedZone.fromLookup(this, 'WilliamMalletHostedZone', {
        domainName: props.domainName
    });

    this.certificate = new acm.Certificate(this, 'williamAlanMallettCert', {
        domainName: props.domainName,
        certificateName: 'William Alan Mallett Cert',
        validation: acm.CertificateValidation.fromDns(this.hostedZone)
    });
  }
}
