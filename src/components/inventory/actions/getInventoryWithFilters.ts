"use server";

import "server-only";
import { getDynamoDBDocumentClient } from "../../../lib/aws/dynamodb/getDynamoDBDocumentClient.ts";
import { paginateScan, ScanCommand } from "@aws-sdk/lib-dynamodb";
import _ from "lodash";
import { ServerActionResponse } from "../../../types/Common.ts";
import { AdditionalInventoryFilters, InventoryData, InventoryItem } from "../types/InventoryTypes.ts";

/** IMPORTANT:
 *  It is generally better to use QueryTables instead of Scan for large tables
 *  But since its a small table, we can use Scan here
 */

export const getInventoryWithFilters = async ({ dt_from, dt_to, filters, pagination, sort }: AdditionalInventoryFilters = {}): Promise<
  ServerActionResponse<InventoryData>
> => {
  /** Validation */
  if (dt_from && dt_to) {
    const dateFrom = new Date(dt_from);
    const dateTo = new Date(dt_to);
    if (!_.isDate(dateFrom) || !_.isDate(dateTo) || _.isNaN(dateFrom.getTime()) || _.isNaN(dateTo.getTime())) {
      return {
        status: 400,
        message: `[getInventory] Bad Request: Invalid date format`,
      };
    }
    if (dateFrom > dateTo) {
      return {
        status: 400,
        message: `[getInventory] Bad Request: dt_from is greater than dt_to`,
      };
    }
  }

  if (filters) {
    /** If price range is provided, check if both values are valid numbers
     *  otherwise if only 1 number is provided, return an error
     */
    if (filters.price_range) {
      if (filters.price_range.length === 1) {
        return {
          status: 400,
          message: `[getInventoryWithFilters] Bad Request: price_range must have 2 values`,
        };
      }
      if (!_.isNumber(filters.price_range[0]) || !_.isNumber(filters.price_range[1])) {
        return {
          status: 400,
          message: `[getInventoryWithFilters] Bad Request: price_range values must be numbers`,
        };
      }
      if (filters.price_range[0] > filters.price_range[1]) {
        return {
          status: 400,
          message: `[getInventoryWithFilters] Bad Request: price_range from must be less than price_range to`,
        };
      }
    }
  }

  if (pagination) {
    if (pagination.page && (pagination.page < 1 || !_.isNumber(pagination.page))) {
      return {
        status: 400,
        message: `[getInventoryWithFilters] Bad Request: pagination page must be greater than 0`,
      };
    }
    if (pagination.limit && (pagination.limit < 1 || !_.isNumber(pagination.limit))) {
      return {
        status: 400,
        message: `[getInventoryWithFilters] Bad Request: pagination limit must be greater than 0`,
      };
    }
  }

  // if (sort) {
  //   /** If the field is empty but order is provided, its still an error */
  //   if (!sort.field && sort.order) {
  //     return {
  //       status: 400,
  //       message: `[getInventoryWithFilters] Bad Request: sort field must be provided`,
  //     };
  //   }
  // }

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

  /** Check if filters are provided */
  if (filters) {
    if (filters.category) {
      scanCommand.input.FilterExpression += " AND #category = :category";
      scanCommand.input.ExpressionAttributeNames!["#category"] = "category";
      scanCommand.input.ExpressionAttributeValues![":category"] = filters.category;
    }

    if (filters.price_range && filters.price_range.length === 2) {
      scanCommand.input.FilterExpression += " AND #price BETWEEN :price_from AND :price_to";
      scanCommand.input.ExpressionAttributeNames!["#price"] = "price";
      scanCommand.input.ExpressionAttributeValues![":price_from"] = filters.price_range[0];
      scanCommand.input.ExpressionAttributeValues![":price_to"] = filters.price_range[1];
    }

    if (filters.name) {
      scanCommand.input.FilterExpression += " AND contains(#name, :name)";
      scanCommand.input.ExpressionAttributeNames!["#name"] = "name";
      scanCommand.input.ExpressionAttributeValues![":name"] = filters.name;
    }
  }

  if (pagination) {
    /** We already did a validation check for this */
    scanCommand.input.Limit = pagination.limit as number;
  }

  /** We will do the sorting ourselves (I did not create an index on "category" that would allow for this
   *  The actual way to do this would be to create an index on "category" with sort keys on the fields, and then use the "QueryCommand"
   *  with ScanIndexForward set to true or false depending on the sort order
   */

  /** Check if categories are provided */
  // if (categories && categories.length > 0) {
  //   /** Add the categories filter */
  //   scanCommand.input.FilterExpression += " AND contains(:categories, #category)";
  //   scanCommand.input.ExpressionAttributeNames!["#category"] = "category";
  //   scanCommand.input.ExpressionAttributeValues![":categories"] = categories ?? [];
  // }

  /** Execute the scan command
   *  Paginate N items at a time
   */
  try {
    const paginatedScan = paginateScan({ client: ddbdClient }, scanCommand.input);
    const results: InventoryItem[] = [];

    if (pagination) {
      if (pagination.page && pagination.page > 0) {
        /** Iterate through paginatedScan and check if
         *  the current page is the required page,
         *  if it is, append the results to the results array and break
         *  if not, continue to the next page until we reach the required page
         */
        let currentPage = 1;
        for await (const page of paginatedScan) {
          if (!page.Items) {
            break;
          }
          if (currentPage === pagination.page) {
            results.push(...(page.Items as InventoryItem[]));
            break;
          }
          currentPage++;
        }
      } else {
        /** Return the first page */
        for await (const page of paginatedScan) {
          if (page.Items) {
            results.push(...(page.Items as InventoryItem[]));
            break;
          }
        }
      }
    } else {
      /** Return all the items */
      for await (const page of paginatedScan) {
        if (page.Items) {
          results.push(...(page.Items as InventoryItem[]));
        }
      }
    }

    /** Sort if required */
    if (sort) {
      const field = sort.field ?? "id";
      results.sort((a, b) => {
        if (sort.order === "asc") {
          return a[field] > b[field] ? 1 : -1;
        } else {
          return a[field] < b[field] ? 1 : -1;
        }
      });
    }

    /** Return data */
    const returnData: InventoryData = {
      items: results,
      total_price: results.reduce((acc, item) => acc + item.price, 0),
      count: results.length,
      page: pagination?.page ? Number(pagination.page) : undefined,
      limit: pagination?.limit ? Number(pagination.limit) : undefined,
    };

    /** Return the response */
    return {
      status: 200,
      message: `[getInventoryWithFilters] Success`,
      data: returnData,
    };
  } catch (error) {
    console.error("[getInventoryWithFilters] Error", error);
    return {
      status: 500,
      message: `[getInventoryWithFilters] Internal Server Error`,
    };
  }
};
