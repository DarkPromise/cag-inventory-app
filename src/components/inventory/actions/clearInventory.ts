"use server";

import "server-only";
import { ServerActionResponse } from "../../../types/Common.ts";
import { getInventory } from "./getInventory.ts";
import { deleteItem } from "./deleteItem.ts";

export const clearInventory = async (): Promise<ServerActionResponse> => {
  /** Clear Inventory
   *  This action is only available in development mode
   */
  if (process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "test") {
    return {
      status: 403,
      message: `[clearInventory] Forbidden`,
    };
  }

  /** Get all inventory items */
  const inventory = await getInventory();
  if (inventory.status !== 200) {
    return {
      status: 500,
      message: `[clearInventory] Internal Server Error`,
    };
  }

  /** Delete all items */
  if (inventory.data && inventory.data.items.length > 0) {
    for (let item of inventory.data.items) {
      await deleteItem(item.id);
    }

    return {
      status: 200,
      message: `[clearInventory] Success`,
    };
  }

  /** Default Response */
  return {
    status: 400,
    message: `[clearInventory] Bad Request`,
  };
};

export default clearInventory;
