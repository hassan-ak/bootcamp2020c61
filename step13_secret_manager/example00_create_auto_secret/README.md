# Step 13-1 Create a new Secret in a Stack

## Steps to code

1. Create a new directory by using `mkdir example00_create_auto_secret`
2. Naviagte to the newly created directory using `cd example00_create_auto_secret`
3. Create a cdk app using `cdk init app --language typescript`
4. Use `npm run watch` to auto build our app as we code
5. Install secret manager in the stack using `npm i @aws-cdk/aws-secretsmanager`
6. Update "lib/example00_create_auto_secret-stack.ts" to create secrets by multiple ways

   ```js
   import * as secretsmanager from "@aws-cdk/aws-secretsmanager";

   const secret1 = new secretsmanager.Secret(this, "Secret1");

   const secret2 = new secretsmanager.Secret(this, "Secret2", {
     secretName: "Secret2",
   });

   const secret3 = new secretsmanager.Secret(this, "Secret3", {
     secretName: "Secret3",
     generateSecretString: {
       secretStringTemplate: JSON.stringify({}),
       generateStringKey: "SecretKey",
     },
   });
   ```

7. Install lambda in the app uisng `npm i @aws-cdk/aws-lambda`
8. Update "lib/example00_create_auto_secret-stack.ts" to create lambda function in the stack

   ```js
   import * as lambda from "@aws-cdk/aws-lambda";

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
   ```

9. Create "lambda/index.ts" to define a lambda function where we display secret keys as output

   ```js
   export async function handler() {
     return {
       statusCode: 200,
       headers: { "Content-Type": "text/plain" },
       body: `Secret1 Key = ${process.env.SECRET_KEY1} ***---*** Secret2 Key = ${process.env.SECRET_KEY2}`,
     };
   }
   ```

10. Install SDk inthe app using `npm i aws-sdk`
11. Update "lambda/index.ts" to access secret in the lambda function and console log it

    ```js
    import { SecretsManager } from "aws-sdk";
    const secretManager = new SecretsManager();
    const secretValue = await secretManager
      .getSecretValue({
        SecretId: "Secret3",
      })
      .promise();
    console.log("Secret3 Values = ", secretValue);
    ```

12. Install IAM using `npm i @aws-cdk/aws-iam`
13. As we are working with lambda to access secrets we need to grant role access to the lambda function so update "lib/example00_create_auto_secret-stack.ts" to do so

    ```js
    import * as iam from "@aws-cdk/aws-iam";
    lambdafn.grantInvoke(
      new iam.ServicePrincipal("secretsmanager.amazonaws.com")
    );
    lambdafn.addToRolePolicy(
      new iam.PolicyStatement({
        resources: [secret3.secretArn],
        actions: ["secretsmanager:GetSecretValue"],
      })
    );
    ```

14. Deploy App using `cdk deploy`
15. Test app functions on AWS web console
16. Destroy the app using `cdk destroy`
