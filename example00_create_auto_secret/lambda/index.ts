import { SecretsManager } from "aws-sdk";

export async function handler() {
  const secretManager = new SecretsManager();
  const secretValue = await secretManager
    .getSecretValue({
      SecretId: "Secret3",
    })
    .promise();

  console.log("Secret3 Values = ", secretValue);
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: `Secret1 Key = ${process.env.SECRET_KEY1} ***---*** Secret2 Key = ${process.env.SECRET_KEY2}`,
  };
}
