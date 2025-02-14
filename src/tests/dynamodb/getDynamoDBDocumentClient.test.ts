import { createDynamoDBClient } from "../../lib/aws/dynamodb/createDynamoDBClient.ts";
import { createDynamoDBDocumentClient } from "../../lib/aws/dynamodb/createDynamoDBDocumentClient.ts";

describe("getDynamoDBDocumentClient", () => {
  it("should return a DynamoDB Document client based on the environment", async () => {
    if (process.env.NODE_ENV === "production") {
      /** Create the client */
      const expected = createDynamoDBClient();
      const expectedDocumentClient = createDynamoDBDocumentClient(expected);

      /** Check the client */
      expect(expectedDocumentClient).toBeDefined();
    } else {
      /** Create the client on port 8000*/
      const expected = createDynamoDBClient({
        region: "localhost",
        ddbConfig: {
          endpoint: "http://localhost:8000",
        },
      });
      const expectedDocumentClient = createDynamoDBDocumentClient(expected);

      /** Check the client */
      expect(expectedDocumentClient).toBeDefined();
    }
  });
});
