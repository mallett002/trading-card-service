#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TradingCardServiceStack } from '../lib/trading-card-service-stack';

const app = new cdk.App();
new TradingCardServiceStack(app, 'TradingCardServiceStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  // env: { account: '123456789012', region: 'us-east-1' },
});