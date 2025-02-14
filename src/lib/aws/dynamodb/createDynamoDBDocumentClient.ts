import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, TranslateConfig } from "@aws-sdk/lib-dynamodb";

/**
 * Create a new DynamoDB Document Client with the provided DynamoDB Client.
 * NOTE: Consider using getDynamoDBDocumentClient() instead of this function.
 * @param ddbClient The DynamoDB Client to use.
 * @returns A new DynamoDB Document Client instance.
 */
export const createDynamoDBDocumentClient = (ddbClient: DynamoDBClient) => {
  const translateConfig: TranslateConfig = {
    marshallOptions: {
      /** Convert empty inputs to `null` */
      convertEmptyValues: false,
      /** Remove undefined values */
      removeUndefinedValues: true,
      /** Convert typeof object to DynamoDB's Map Attribute */
      convertClassInstanceToMap: true,
    },
    unmarshallOptions: {
      /** Return numbers as NumberValue */
      wrapNumbers: false,
    },
  };
  return DynamoDBDocumentClient.from(ddbClient, translateConfig);
};
