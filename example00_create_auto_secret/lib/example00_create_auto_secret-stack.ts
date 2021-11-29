import * as cdk from "@aws-cdk/core";
import * as secretsmanager from "@aws-cdk/aws-secretsmanager";
import * as lambda from "@aws-cdk/aws-lambda";
import * as iam from "@aws-cdk/aws-iam";

export class Example00CreateAutoSecretStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create new secrets

    // Secret with no name
    const secret1 = new secretsmanager.Secret(this, "Secret1");

    // Secret with predefined name
    const secret2 = new secretsmanager.Secret(this, "Secret2", {
      secretName: "Secret2",
    });

    // User defined secret
    const secret3 = new secretsmanager.Secret(this, "Secret3", {
      secretName: "Secret3",
      generateSecretString: {
        secretStringTemplate: JSON.stringify({}),
        generateStringKey: "SecretKey",
      },
    });

    // Lambda Function
    const lambdafn = new lambda.Function(this, "Step13-1LambdaFunction", {
      functionName: "Step13-1LambdaFunction",
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "index.handler",
      environment: {
        SECRET_KEY1: `${
          secretsmanager.Secret.fromSecretAttributes(this, "SecretKey1", {
            secretCompleteArn: secret1.secretArn,
          }).secretValue
        }`,
        SECRET_KEY2: `${
          secretsmanager.Secret.fromSecretNameV2(
            this,
            "SecretKey2",
            secret2.secretName
          ).secretValue
        }`,
      },
    });

    // Role access for lambda function
    lambdafn.grantInvoke(
      new iam.ServicePrincipal("secretsmanager.amazonaws.com")
    );
    lambdafn.addToRolePolicy(
      new iam.PolicyStatement({
        resources: [secret3.secretArn],
        actions: ["secretsmanager:GetSecretValue"],
      })
    );
  }
}
