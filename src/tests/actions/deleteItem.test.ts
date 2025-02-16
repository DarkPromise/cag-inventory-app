import { addItem } from "../../components/inventory/actions/addItem.ts";
import { deleteItem } from "../../components/inventory/actions/deleteItem.ts";

beforeAll(async () => {
  /** Add an item to delete */
  await addItem("test-delete-item-name", 0, "test-delete-item-category", "test-delete-item-id");
});

describe("Server Action: deleteItem()", () => {
  /** Expect an error when id is not provided */
  it("should fail with a 400 status if id is not provided", async () => {
    const response = await deleteItem("");
    expect(response.status).toBe(400);
  });

  /** Expect a 200 status when id is provided */
  it("should return a 200 status if id is provided", async () => {
    const response = await deleteItem("test-delete-item-id");
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
  });

  /** Expect a 200 status when id is not found
   *  Due to the way dynamodb works, a delete will still return 200
   *  but with the attributes as undefined if using ALL_OLD as the return value
   */
  it("should return a 200 status if id is not found", async () => {
    const response = await deleteItem("test-delete-item-id");
    expect(response.status).toBe(200);
    expect(response.data).toBeUndefined();
  });
});

/** No need to delete anything here... since we're testing the delete function */
