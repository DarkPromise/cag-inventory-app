/** Common types used throughout the app */

export interface InventoryFilters {
  dt_from?: string;
  dt_to?: string;
  category?: string; // single category
  // categories?: string[]; // I originally had this before I reread the requirements that only needed a single category
}

export interface AdditionalInventoryFilters {
  filters?: {
    name?: string;
    category?: string;
    price_range?: number[];
  };
  pagination?: {
    page: number;
    limit: number;
  };
  sort?: {
    field: string;
    order: "asc" | "desc";
  };
}

/**
 * @interface
 * @name InventoryItem
 * @description Interface for inventory item
 * @param {string} id - The id of the item
 * @param {string} name - The name of the item
 * @param {string} category - The category of the item
 * @param {number} price - The price of the item
 * @param {string} created_dt - The date the item was created
 * @param {string} last_updated_dt - The date the item was last updated
 */
export interface InventoryItem {
  id: string; // uuid
  name: string;
  category: string;
  price: number;
  created_dt: string; // yyyy-mm-dd hh:mm:ss
  last_updated_dt: string; // yyyy-mm-dd hh:mm:ss
}

/**
 * @interface
 * @name InventoryData
 * @description Interface for inventory data
 * @param {InventoryItem[]} items - The items in the inventory
 * @param {number} total_price - The total price of all items
 */
export interface InventoryData {
  items: InventoryItem[];
  total_price: number;
}

/**
 * @interface
 * @name ServerActionResponse
 * @description Interface for server action response
 * @param {number} status - The status code of the response
 * @param {string} message - The message of the response
 * @param {T} data - The data of the response
 */
export interface ServerActionResponse<T = any> {
  status: number;
  message: string;
  data?: T;
}
