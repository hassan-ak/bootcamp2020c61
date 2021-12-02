import * as cdk from "@aws-cdk/core";
import * as secretsmanager from "@aws-cdk/aws-secretsmanager";
import * as lambda from "@aws-cdk/aws-lambda";
import * as iam from "@aws-cdk/aws-iam";

export class Example01RotateSecretWithLambdaStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create new secret
    const secret = new secretsmanager.Secret(this, "Secret", {
      secretName: "secret-rotating",
      description: "Rotating Secret",
      generateSecretString: {
        secretStringTemplate: JSON.stringify({}),
        generateStringKey: "SecretKey",
      },
    });

    // Lambda Function
    const lambdafn = new lambda.Function(this, "lambdaSecretRotate", {
      functionName: "lambdaSecretRotate",
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "index.handler",
      environment: {
        REGION: cdk.Stack.of(this).region,
        SECRET_NAME: "secret-rotating",
        SECRET_KEY: "SecretKey",
      },
    });

    // Add rotation to secret
    secret.addRotationSchedule("RotationSchedule", {
      rotationLambda: lambdafn,
      automaticallyAfter: cdk.Duration.hours(24),
    });

    // Add read access to secret
    secret.grantRead(lambdafn);

    // define role for lambda function
    lambdafn.grantInvoke(
      new iam.ServicePrincipal("secretsmanager.amazonaws.com")
    );
    lambdafn.addToRolePolicy(
      new iam.PolicyStatement({
        resources: [secret.secretArn],
        actions: ["secretsmanager:PutSecretValue"],
      })
    );
  }
}
