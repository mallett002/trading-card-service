#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

import {ProductionStage} from '../lib/stages/production-stage';

const app = new cdk.App();

new ProductionStage(app, 'prod');
