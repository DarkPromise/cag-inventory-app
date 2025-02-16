"use server";

import "server-only";
import { ServerActionResponse } from "../../../types/Common.ts";
import _ from "lodash";
import { getDynamoDBDocumentClient } from "../../../lib/aws/dynamodb/getDynamoDBDocumentClient.ts";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { toISO8601Date } from "../../../utils/toISO8601Date.ts";
import { getInventory } from "./getInventory.ts";
import { v4 } from "uuid";
import { InventoryItem } from "../types/InventoryTypes.ts";

/**
 * Add Item Action
 * @param name The item name
 * @param price The item price
 * @param category The item category
 * @param id The item id (optional)
 * @returns The server response
 */
export const addItem = async (name: string, price: number, category: string, id?: string): Promise<ServerActionResponse<InventoryItem>> => {
  /** Validation */
  if (!name || !_.isNumber(price) || !category) {
    return {
      status: 400,
      message: `[addItem] Missing required fields`,
    };
  }

  /** Get the dynamodb document client */
  const ddbdClient = getDynamoDBDocumentClient();

  /** IMPORTANT:
   *  Since there is a requirement to generate a UUID for each item and
   *  if the item already exists, we need to update the item instead of creating a new one,
   *  there are a few ways to do this.
   *
   *  1. Check if the item already exists by using QueryTable and if it exists, update the item using PutCommand or UpdateCommand.
   *
   *  2. Make use of InventoryTable initial data that gets all the items from the database along with its id
   *  and supply the id to the PutCommand. This way, we can update the item if it already exists.
   *
   *  For simplicity sake and since we are running on the server, I will reuse the getInventory action
   *  to get all the items and their ids, then use the id to update the item.
   *  In reality this is bad practice, since we are getting all the items just to get the id of the item we want to update.
   *  It may be better to keep cache of the items and their ids in Redis or some other cache store.
   */

  /** Get the inventory items */
  const inventoryResponse = await getInventory();
  if (inventoryResponse.status !== 200) {
    /** We could return the inventory response, since its also a server action,
     *  but the message may not be relevant to the current action
     */
    return {
      status: 500,
      message: `[addItem] Internal Server Error`, // We can change this to a more relevant message
    };
  }

  /** Get the id (if an item with the same name exists) */
  id = inventoryResponse.data?.items.find((item) => item.name === name)?.id ?? id;

  /** Execute the get command */
  try {
    /** Prepare the put command */
    const putCommand = new PutCommand({
      TableName: process.env.TABLE_NAME,
      Item: {
        id: id?.trim() ?? v4(),
        name: name.trim(),
        price: price,
        category: category.trim(),
        created_at: toISO8601Date(),
        last_updated_dt: toISO8601Date(),
      },
      ReturnValues: "ALL_OLD", // Optional, but we can use this to get the old item
    });

    /** Execute the put command
     *  If the command fails, an exception will be thrown and the catch block will be executed,
     *  so we don't ACTUALLY need to check the response, unless we want to return the old item
     */
    const putResponse = await ddbdClient.send(putCommand);
    if (putResponse.Attributes) {
      return {
        status: 200,
        message: `[addItem] Success`,
        data: putResponse.Attributes as InventoryItem,
      };
    }

    /** Return the success response */
    return {
      status: 200,
      message: `[addItem] Success`,
    };
  } catch (error) {
    console.error("[addItem] Error", error);
    return {
      status: 500,
      message: `[addItem] Internal Server Error`,
    };
  }

  /** Default Response */
  return {
    status: 400,
    message: `[addItem] Bad Request`,
  };
};

/**
 * Add Item Form Action
 * @param prevFormState The previous form state
 * @param formData The form data
 * @returns The server response
 */
export const addItemFA = async (prevFormState: any, formData: FormData): Promise<ServerActionResponse<InventoryItem>> => {
  /** Variables */
  const name = formData.get("name") as string;
  const price = Number(formData.get("price"));
  const category = formData.get("category") as string;
  const id = formData.get("id") as string;
  return addItem(name, price, category, id ?? undefined);
};
