import * as cdk from "@aws-cdk/core";
import * as secretsmanager from "@aws-cdk/aws-secretsmanager";

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
  }
}
