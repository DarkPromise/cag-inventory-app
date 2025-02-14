import { createDynamoDBClient } from "../../lib/aws/dynamodb/createDynamoDBClient.ts";

describe("getDynamoDBClient", () => {
  it("should return a DynamoDB client based on the environment", async () => {
    if (process.env.NODE_ENV === "production") {
      /** Create the client */
      const expected = createDynamoDBClient();

      /** Check the client */
      expect(expected).toBeDefined();

      /** Check the endpoint */
      const endpoint = await expected.config.endpoint?.();
      expect(endpoint).toBeDefined();
      expect(endpoint?.hostname).not.toBe("localhost"); // In production, the hostname should not be localhost
    } else {
      /** Create the client on port 8000*/
      const expected = createDynamoDBClient({
        region: "localhost",
        ddbConfig: {
          endpoint: "http://localhost:8000",
        },
      });

      /** Check the client */
      expect(expected).toBeDefined();

      /** Check the endpoint */
      const endpoint = await expected.config.endpoint?.();
      expect(endpoint).toBeDefined();
      expect(endpoint?.hostname).toBe("localhost");
      expect(endpoint?.port).toBe(8000); // Potential to fail if the port is changed, but hardcoded for this project
    }
  });
});
