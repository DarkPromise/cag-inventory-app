import { createDynamoDBClient } from "./createDynamoDBClient.ts";
import { createDynamoDBDocumentClient } from "./createDynamoDBDocumentClient.ts";

/**
 * Creates a DynamoDB Document client based on the environment
 * @returns The DynamoDB Document client
 */
export const getDynamoDBDocumentClient = () => {
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
    const ddbClient = createDynamoDBClient({
      region: "localhost",
      ddbConfig: {
        endpoint: "http://localhost:8000",
      },
    });
    const ddbDocumentClient = createDynamoDBDocumentClient(ddbClient);
    return ddbDocumentClient;
  } else if (process.env.NODE_ENV === "production") {
    const ddbClient = createDynamoDBClient();
    const ddbDocumentClient = createDynamoDBDocumentClient(ddbClient);
    return ddbDocumentClient;
  } else {
    throw new Error("[getDynamoDBDocumentClient] Invalid NODE_ENV");
  }
};
