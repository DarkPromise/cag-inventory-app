"use server";

import "server-only";
import { ServerActionResponse } from "../../../types/Common.ts";
import { createFakeItem } from "../utils/createFakeItem.ts";
import { addItem } from "./addItem.ts";

export const populateInventory = async (count: number): Promise<ServerActionResponse> => {
  /** DEVELOPMENT ONLY */
  if (process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "test") {
    return {
      status: 403,
      message: `[populateInventory] Forbidden`,
    };
  }

  /** Add items */
  try {
    for (let i = 0; i < count; i++) {
      const fakeItem = createFakeItem();
      await addItem(fakeItem.name, fakeItem.price, fakeItem.category);
    }
    /** Return the success response */
    return {
      status: 200,
      message: `[populateInventory] Success`,
    };
  } catch (error) {
    console.error("[populateInventory] Error", error);
    return {
      status: 500,
      message: `[populateInventory] Internal Server Error`,
    };
  }

  /** Default Response */
  return {
    status: 400,
    message: `[populateInventory] Bad Request`,
  };
};

export default populateInventory;
