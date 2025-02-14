import _ from "lodash";

/**
 * Removes all null, undefined, and empty values from an object
 * @param obj The object to clean
 * @returns The cleaned object
 */
export const cleanObject = (obj: any) => {
  /** If the obj is not actually an object, just return it back */
  if (!_.isObject(obj)) {
    return obj;
  }

  /** Check for array */
  if (_.isArray(obj)) {
    return _.chain(obj).map(cleanObject).compact().value();
  }

  /** Check for object */
  if (_.isObject(obj)) {
    //const test = _.chain(obj).mapValues(cleanObject).pickBy(_.identity).value();
    //const test2 = _.chain(obj).mapValues(cleanObject).omitBy(_.isEmpty).value();
    return _.chain(obj).mapValues(cleanObject).omitBy(_.isEmpty).value();
  }
};
