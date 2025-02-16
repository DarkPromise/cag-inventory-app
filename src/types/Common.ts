/** Common types used throughout the app */

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
