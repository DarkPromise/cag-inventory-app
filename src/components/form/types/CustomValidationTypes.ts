/** File for custom validation types using zod and lodash*/
import { z } from "zod";

/** Usage:
 *  For form fields that require a number but can be empty
 */
export const zodStringNumber = z
  .string()
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .refine((value) => value === null || !isNaN(Number(value)))
  .transform((value) => (value === null ? undefined : Number(value)));
