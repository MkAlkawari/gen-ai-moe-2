#!/usr/bin/env bash
echo "Deploying project"

npm install
npm install react-dropzone
npm install @heroicons/react
npm install chart.js

npx cdk bootstrap aws://600627328431/us-east-1 --force \
  --cloudformation-execution-policies arn:aws:iam::600627328431:policy/Cdk_Least \
  --no-public-access-block-configuration

npx sst deploy --stage prod
