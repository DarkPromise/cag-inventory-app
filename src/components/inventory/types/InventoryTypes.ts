/** Types for Inventory
 *  Also includes the schemas for the types
 */
import { z } from "zod";
import { zodStringNumber } from "../../form/types/CustomValidationTypes.ts";

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
 * Schema for InventoryItem
 */
export const InventoryItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  price: z.coerce.number(),
  created_dt: z.string(),
  last_updated_dt: z.string(),
});

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
  count?: number;
  page?: number;
  limit?: number;
}

/**
 * @interface
 * @name InventoryFilters
 * @description Interface for inventory filters
 * @param {string} dt_from - The date from which to filter
 * @param {string} dt_to - The date to which to filter
 * @param {string} category - The category to filter
 */
export interface InventoryFilters {
  dt_from?: string;
  dt_to?: string;
  category?: string; // single category
  // categories?: string[]; // I originally had this before I realized we only only needed a single category
}

/**
 * Schema for InventoryFilters
 */
export const InventoryFiltersSchema = z.object({
  dt_from: z
    .string()
    .optional()
    .transform((value) => value || "0000-01-01 00:00:00+08:00"),
  dt_to: z
    .string()
    .optional()
    .transform((value) => value || "9999-12-31 23:59:59+08:00"),
  category: z.string().optional(),
});

/**
 * @interface
 * @name AdditionalInventoryFilters
 * @description Interface for additional inventory filters which extends InventoryFilters
 * @param {object} filters - The filters to apply
 * @param {object} pagination - The pagination to apply
 * @param {object} sort - The sort to apply
 */
export interface AdditionalInventoryFilters extends Omit<InventoryFilters, "category"> {
  filters?: {
    name?: string;
    category?: string;
    price_range?: number[] | string[];
  };
  pagination?: {
    page: number | "";
    limit: number | "";
  };
  sort?: {
    field: string;
    order: string;
  };
}

/**
 * Schema for AdditionalInventoryFilters
 */
export const AdditionalInventoryFiltersSchema = z.object({
  ...InventoryFiltersSchema.shape,
  filters: z
    .object({
      name: z.string().optional(),
      category: z.string().optional(),
      price_range: z.array(zodStringNumber.optional()).refine((value) => value.length === 0 || value.length === 2),
    })
    .optional(),
  pagination: z
    .object({
      page: z.coerce.number().optional(),
      limit: z.coerce.number().optional(),
    })
    .optional(),
  sort: z
    .object({
      field: z.string().optional(),
      order: z.string().optional(),
    })
    .optional(),
});
