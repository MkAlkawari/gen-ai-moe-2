#!/usr/bin/env bash
echo "Deploying project"

source ~/.bashrc
nohup dockerd &
docker version
npm install
npm audit fix

npx cdk bootstrap aws://600627328431/us-east-1 --force \
  --cloudformation-execution-policies arn:aws:iam::600627328431:policy/Cdk_Least \
  --no-public-access-block-configuration

npx sst deploy --stage prod
