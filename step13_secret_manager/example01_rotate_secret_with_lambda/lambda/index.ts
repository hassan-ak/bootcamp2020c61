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
