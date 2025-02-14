import { createDynamoDBClient } from "./createDynamoDBClient.ts";

/**
 * Creates a DynamoDB client based on the environment
 * @returns The DynamoDB client
 */
export const getDynamoDBClient = () => {
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
    const ddbClient = createDynamoDBClient({
      region: "localhost",
      ddbConfig: {
        endpoint: "http://localhost:8000",
      },
    });
    return ddbClient;
  } else if (process.env.NODE_ENV === "production") {
    const ddbClient = createDynamoDBClient();
    return ddbClient;
  } else {
    throw new Error("[getDynamoDBClient] Invalid NODE_ENV");
  }
};
