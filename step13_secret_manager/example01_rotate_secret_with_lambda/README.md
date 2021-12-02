# Step 13-2 Rotate secret with lambda

## Steps to code

1. Create a new directory by using `mkdir example01_rotate_secret_with_lambda`
2. Naviagte to the newly created directory using `cd example01_rotate_secret_with_lambda`
3. Create a cdk app using `cdk init app --language typescript`
4. Use `npm run watch` to auto build our app as we code
5. Install secret manager in the stack using `npm i @aws-cdk/aws-secretsmanager`
6. Update "lib/example01_rotate_secret_with_lambda-stack.ts" to create secret

   ```js
   import * as secretsmanager from "@aws-cdk/aws-secretsmanager";

   const secret = new secretsmanager.Secret(this, "Secret", {
     secretName: "Secret",
     description: "Rotating Secret",
     generateSecretString: {
       secretStringTemplate: JSON.stringify({}),
       generateStringKey: "SecretKey",
     },
   });
   ```

7. Install lambda in the app uisng `npm i @aws-cdk/aws-lambda`
8. Update "lib/example01_rotate_secret_with_lambda-stack.ts" to create lambda function in the stack

   ```js
   import * as lambda from "@aws-cdk/aws-lambda";

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
   ```

9. Update "lib/example01_rotate_secret_with_lambda-stack.ts" to define rotation for secret

   ```js
   secret.addRotationSchedule("RotationSchedule", {
     rotationLambda: lambdafn,
     automaticallyAfter: cdk.Duration.hours(24),
   });
   ```

10. Update "lib/example01_rotate_secret_with_lambda-stack.ts" to give read access of lambda function to the secret

    ```js
    secret.grantRead(lambdafn);
    ```

11. Install IAM using `npm i @aws-cdk/aws-iam`
12. As we are working with lambda to access secrets we need to grant role access to the lambda function so update "lib/example01_rotate_secret_with_lambda-stack.ts" to do so

    ```js
    import * as iam from "@aws-cdk/aws-iam";
    lambdafn.grantInvoke(
      new iam.ServicePrincipal("secretsmanager.amazonaws.com")
    );
    lambdafn.addToRolePolicy(
      new iam.PolicyStatement({
        resources: [secret.secretArn],
        actions: ["secretsmanager:PutSecretValue"],
      })
    );
    ```

---

11. Install SDk inthe app using `npm i aws-sdk`
12. Install crypto in app using `npm i crypto`
13. Create "lambda/index.ts" to define a lambda function where we update secret value

    ```js
    import { randomBytes } from "crypto";
    import { SecretsManager } from "aws-sdk";

    const secretName = process.env.SECRET_NAME || "";
    const secretKey = process.env.SECRET_KEY || "";
    const secretManager = new SecretsManager({
      region: process.env.REGION || "us-east-2",
    });

    interface Event {
      SecretId: string;
      ClientRequestToken: string;
      Step: "createSecret" | "setSecret" | "testSecret" | "finishSecret";
    }

    export async function handler(event: Event) {
      if (event.Step === "createSecret") {
        await secretManager
          .putSecretValue({
            SecretId: secretName,
            SecretString: JSON.stringify({
              [secretKey]: randomBytes(32).toString("hex"),
            }),
            VersionStages: ["AWSCURRENT"],
          })
          .promise();
      }
    }
    ```

14. Deploy App using `cdk deploy`
15. Test app functions on AWS web console
16. Destroy the app using `cdk destroy`
