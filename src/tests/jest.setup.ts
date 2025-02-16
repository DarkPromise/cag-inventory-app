import { CreateTableCommand } from "@aws-sdk/client-dynamodb";
import { getDynamoDBDocumentClient } from "../lib/aws/dynamodb/getDynamoDBDocumentClient.ts";

const setupJest = async () => {
  /** Setup the Table */
  try {
    /** Set the TABLE_NAME environment variable */
    process.env.TABLE_NAME = "TestInventory";

    /** Create the table */
    const ddbdClient = getDynamoDBDocumentClient();
    const createTableCommand = new CreateTableCommand({
      TableName: "TestInventory",
      AttributeDefinitions: [
        {
          AttributeName: "id",
          AttributeType: "S",
        },
      ],
      KeySchema: [
        {
          AttributeName: "id",
          KeyType: "HASH",
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      },
    });
    await ddbdClient.send(createTableCommand);
  } catch (error) {
    console.error("[setupJest] setupJest failed, unable to continue with testing");
    throw error;
  }
};

export default setupJest;
