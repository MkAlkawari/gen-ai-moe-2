#!/usr/bin/env bash
echo "Deploying project"

source ~/.bashrc
nohup dockerd &
docker version
npm install
npm install react-dropzone
npm install @heroicons/react
npm install chart.js
npx sst deploy --stage prod --force --cloudformation-execution-policies arn:aws:iam::600627328431:policy/Cdk_Least --template iGA_CloudFormation_Tamplate.yaml
