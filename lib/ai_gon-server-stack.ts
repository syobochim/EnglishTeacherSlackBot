import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class AiGonServerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const messagesTable = new dynamodb.Table(this, "messagesTable", {
      tableName: "AIGon-messages",
      partitionKey: {
        name: "userId",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "timestamp",
        type: dynamodb.AttributeType.NUMBER
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const openAiSecret = ssm.StringParameter.valueForStringParameter(
        this,
        "openAiSecret"
    );

    const apiFn = new nodejs.NodejsFunction(this, "apiFn", {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: "src/lambda/api-handler.js",
      environment: {
        OPENAI_API_KEY: openAiSecret,
        DYNAMODB_TABLE_NAME: messagesTable.tableName
      },
      bundling: {
        sourceMap: true,
      },
      timeout: cdk.Duration.seconds(29),
    });
    messagesTable.grantReadWriteData(apiFn);

    const api = new apigateway.RestApi(this, "api", {
      deployOptions: {
        tracingEnabled: true,
        stageName: "api",
      },
    });
    const chatApiResource = api.root.addResource('chat');
    chatApiResource.addMethod('POST', new apigateway.LambdaIntegration(apiFn))
  }
}