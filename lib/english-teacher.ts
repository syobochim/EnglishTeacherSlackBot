import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from 'aws-cdk-lib/aws-iam';

export class EnglishTeacherStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const messagesTable = new dynamodb.Table(this, "messagesTable", {
      tableName: "EnglishTeacher-messages",
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

    const phrasesTable = new dynamodb.Table(this, "phrasesTable", {
      tableName: "EnglishTeacher-phrases",
      partitionKey: {
        name: "userId",
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: "phrase",
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // SSM Parameter Storeにアクセスするためのポリシーステートメント
    const ssmPolicyStatement = new iam.PolicyStatement({
      actions: ['ssm:GetParameter'],
      effect: iam.Effect.ALLOW,
      resources: [
        'arn:aws:ssm:ap-northeast-1:007738562588:parameter/englishTeacherAPI',
        'arn:aws:ssm:ap-northeast-1:007738562588:parameter/openAiSecret',
      ],
    });

    const apiFn = new nodejs.NodejsFunction(this, "EnglishTeacherApiFn", {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: "src/lambda/api-handler.js",
      environment: {
        MESSAGE_TABLE_NAME: messagesTable.tableName,
        PHRASES_TABLE_NAME: phrasesTable.tableName,
      },
      bundling: {
        sourceMap: true,
      },
      timeout: cdk.Duration.seconds(29),
    });
    messagesTable.grantReadWriteData(apiFn);
    phrasesTable.grantReadWriteData(apiFn);
    apiFn.addToRolePolicy(ssmPolicyStatement);

    const api = new apigateway.RestApi(this, "EnglishTeacherApi", {
      deployOptions: {
        tracingEnabled: true,
        stageName: "api",
      },
    });
    const chatApiResource = api.root.addResource('chat');
    chatApiResource.addMethod('POST', new apigateway.LambdaIntegration(apiFn))
  }
}