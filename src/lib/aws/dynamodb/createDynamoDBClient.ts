import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";

/**
 * Create a new DynamoDB client with the provided configuration.
 * NOTE: Consider using getDynamoDBClient() instead of this function.
 * @param region The AWS region to use.
 * @param ddbConfig Additional configuration options for the client.
 * @returns A new DynamoDB client instance.
 */
export const createDynamoDBClient = ({
  region = "ap-southeast-1",
  ddbConfig,
}: {
  region?: string;
  ddbConfig?: DynamoDBClientConfig;
} = {}): DynamoDBClient => {
  return new DynamoDBClient({ region: region, ...ddbConfig });
};
