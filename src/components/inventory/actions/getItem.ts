"use server";

import "server-only";
import { ServerActionResponse } from "../../../types/Common.ts";
import { getDynamoDBDocumentClient } from "../../../lib/aws/dynamodb/getDynamoDBDocumentClient.ts";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { InventoryItem } from "../types/InventoryTypes.ts";

/**
 * Get an item from the inventory
 * @param id The item id
 * @returns The server response with the item
 */
export const getItem = async (id: string): Promise<ServerActionResponse<InventoryItem>> => {
  /** Validation */
  if (!id) {
    return {
      status: 400,
      message: `[getItem] Missing required fields`,
    };
  }

  /** Get the dynamodb document client */
  const ddbdClient = getDynamoDBDocumentClient();

  /** Get Command */
  const getCommand = new GetCommand({
    TableName: process.env.TABLE_NAME,
    Key: {
      id: id,
    },
  });

  /** Execute the get command */
  try {
    const response = await ddbdClient.send(getCommand);
    if (response.Item) {
      return {
        status: 200,
        message: `[getItem] Success`,
        data: response.Item as InventoryItem,
      };
    } else {
      return {
        status: 404,
        message: `[getItem] Not Found`,
      };
    }
  } catch (error) {
    return {
      status: 500,
      message: `[getItem] Internal Server Error`,
    };
  }

  /** Default Response */
  return {
    status: 400,
    message: `[getItem] Bad Request`,
  };
};

export default getItem;
