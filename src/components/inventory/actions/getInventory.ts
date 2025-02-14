"use server";

import "server-only";
import { InventoryData, InventoryFilters, InventoryItem, ServerActionResponse } from "@/types/Common.ts";
import { getDynamoDBDocumentClient } from "../../../lib/aws/dynamodb/getDynamoDBDocumentClient.ts";
import { paginateScan, ScanCommand } from "@aws-sdk/lib-dynamodb";

export const getInventory = async ({ dt_from, dt_to, category }: InventoryFilters = {}): Promise<ServerActionResponse<InventoryData>> => {
  /** DEBUGGING */
  // console.log("[getInventory] Filters", { dt_from, dt_to, category });

  /** Validation */
  if (dt_from && dt_to) {
    if (new Date(dt_from) > new Date(dt_to)) {
      return {
        status: 400,
        message: `[getInventory] Bad Request: dt_from is greater than dt_to`,
      };
    }
  }

  /** No need to check for category, if its empty we return everything */

  /** Get the dynamodb document client */
  const ddbdClient = getDynamoDBDocumentClient();

  /** Prepare the scan command input
   *  Normally we can just send the scan command, but for pagination, we need to use paginateScan
   *  IMPORTANT:
   *  The BETWEEN operator is not inclusive, so if we really want to include the dt_from and dt_to
   *  then we need to add a second to the dt_to and subtract a second from the dt_from.
   *  This is not implemented here.
   */
  let scanCommand = new ScanCommand({
    TableName: process.env.TABLE_NAME,
    FilterExpression: "#last_updated_dt BETWEEN :dt_from AND :dt_to",
    ExpressionAttributeNames: {
      "#last_updated_dt": "last_updated_dt",
    },
    ExpressionAttributeValues: {
      ":dt_from": dt_from ? `${dt_from}+08:00` : "0000-01-01 00:00:00+08:00", // Default to 0000-01-01 00:00:00+08:00 SG Time
      ":dt_to": dt_to ? `${dt_to}+08:00` : "9999-12-31 23:59:59+08:00", // Default to 9999-12-31 23:59:59+08:00 SG Time
    },
  });

  /** Check if category is not empty string */
  if (category) {
    /** Add the category filter */
    scanCommand.input.FilterExpression += " AND #category = :category";
    scanCommand.input.ExpressionAttributeNames!["#category"] = "category";
    scanCommand.input.ExpressionAttributeValues![":category"] = category;
  }

  /** Execute the scan command
   *  This will return all the items in the inventory
   */
  try {
    /** Using paginateScan here since BatchGetItems have a limitation of 100 items */
    const paginatedScan = paginateScan({ client: ddbdClient }, scanCommand.input);
    const results: InventoryItem[] = [];
    for await (const page of paginatedScan) {
      if (page.Items) {
        results.push(...(page.Items as InventoryItem[]));
      }
    }

    /** Return the response */
    return {
      status: 200,
      message: `[getInventory] Success`,
      data: {
        items: results,
        total_price: results.reduce((acc, item) => acc + item.price, 0),
      },
    };
  } catch (error) {
    console.error("[getInventory] Error", error);
    return {
      status: 500,
      message: `[getInventory] Internal Server Error`,
    };
  }
};
