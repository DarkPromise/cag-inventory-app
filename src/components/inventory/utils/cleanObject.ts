import _ from "lodash";
import { isEmptyOrInvalid } from "./isEmptyOrInvalid.ts";

/**
 * Removes all null, undefined, and empty values from an object
 * @param obj The object to clean
 * @returns The cleaned object
 */
export const cleanObject = <T>(obj: T): T => {
  if (!_.isObject(obj)) {
    return obj;
  }
  if (_.isArray(obj)) {
    return _.chain(obj).map(cleanObject).compact().value() as unknown as T;
  }
  return _.chain(obj).mapValues(cleanObject).omitBy(_.isEmpty).value() as unknown as T;
};

export const cleanObject2 = <T>(obj: T): T => {
  if (!_.isObject(obj)) {
    return obj;
  }
  if (_.isArray(obj)) {
    return _.chain(obj).map(cleanObject2).compact().value() as unknown as T;
  }
  return _.chain(obj).mapValues(cleanObject2).omitBy(_.isEmpty).value() as unknown as T;
};
