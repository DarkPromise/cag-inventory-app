"use server";

import "server-only";
import { InventoryItem, ServerActionResponse } from "../../../types/Common.ts";
import { getDynamoDBDocumentClient } from "../../../lib/aws/dynamodb/getDynamoDBDocumentClient.ts";
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";

export const deleteItem = async (id: string): Promise<ServerActionResponse<InventoryItem>> => {
  /** Validation */
  if (!id) {
    return {
      status: 400,
      message: `[deleteItem] Missing required fields`,
    };
  }

  /** Get the dynamodb document client */
  const ddbdClient = getDynamoDBDocumentClient();

  /** Delete Command */
  const deleteCommand = new DeleteCommand({
    TableName: process.env.TABLE_NAME,
    Key: {
      id: id,
    },
  });

  try {
    await ddbdClient.send(deleteCommand);
    return {
      status: 200,
      message: `[deleteItem] Success`,
    };
  } catch (error) {
    return {
      status: 500,
      message: `[deleteItem] Internal Server Error`,
    };
  }

  /** Default Response */
  return {
    status: 400,
    message: `[deleteItem] Bad Request`,
  };
};

export const deleteItemFA = async (prevFormState: any, formData: FormData): Promise<ServerActionResponse<InventoryItem>> => {
  /** Variables */
  const id = formData.get("id") as string;

  return deleteItem(id);
};
