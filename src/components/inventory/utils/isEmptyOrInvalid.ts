import _ from "lodash";

export const isEmptyOrInvalid = <T>(value: T): boolean => {
  return _.isEmpty(value) && !_.isNumber(value) && _.isNil(value) && _.isNaN(value);
};
