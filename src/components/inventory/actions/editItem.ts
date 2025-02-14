"use server";

import "server-only";
import { InventoryItem, ServerActionResponse } from "../../../types/Common.ts";
import { getDynamoDBDocumentClient } from "../../../lib/aws/dynamodb/getDynamoDBDocumentClient.ts";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

export const editItem = async (id: string, data: Partial<InventoryItem>): Promise<ServerActionResponse<InventoryItem>> => {
  /** Validation */
  if (!id) {
    return {
      status: 400,
      message: `[editItem] Missing required fields`,
    };
  }

  /** Get the dynamodb document client */
  const ddbdClient = getDynamoDBDocumentClient();

  /** Create the update expression, attribute names and values for available
   *  keys in the data object
   */
  let updateExpression = "set";
  let expressionAttributeNames: any = {};
  let expressionAttributeValues: any = {};

  for (const key in data) {
    updateExpression += ` #${key} = :${key},`;
    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] = data[key];
  }

  /** Update Command */
  const updateCommand = new UpdateCommand({
    TableName: process.env.TABLE_NAME,
    Key: {
      id: id,
    },
    UpdateExpression: updateExpression.slice(0, -1), // Remove the last comma
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW", // Optional, but we can use this to get the new item
  });

  /** Execute the update command */
  try {
    const response = await ddbdClient.send(updateCommand);
    return {
      status: 200,
      message: `[editItem] Success`,
      data: response.Attributes as InventoryItem,
    };
  } catch (error) {
    return {
      status: 500,
      message: `[editItem] Internal Server Error`,
    };
  }

  /** Default Response */
  return {
    status: 400,
    message: `[editItem] Bad Request`,
  };
};

export default editItem;
