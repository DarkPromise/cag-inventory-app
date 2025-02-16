import { DeleteTableCommand } from "@aws-sdk/client-dynamodb";
import { getDynamoDBDocumentClient } from "../lib/aws/dynamodb/getDynamoDBDocumentClient.ts";

const teardownJest = async () => {
  /** Delete the Table */
  try {
    const ddbdClient = getDynamoDBDocumentClient();
    await ddbdClient.send(new DeleteTableCommand({ TableName: "TestInventory" }));

    /** Unset the TABLE_NAME environment variable */
    delete process.env.TABLE_NAME;
  } catch (error) {
    console.error("[teardownJest] teardownJest failed, unable to continue with testing");
    throw error;
  }
};

export default teardownJest;
