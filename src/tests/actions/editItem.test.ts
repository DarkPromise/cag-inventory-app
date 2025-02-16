import { addItem } from "../../components/inventory/actions/addItem.ts";
import { deleteItem } from "../../components/inventory/actions/deleteItem.ts";
import editItem from "../../components/inventory/actions/editItem.ts";

beforeAll(async () => {
  /** Add an item to edit */
  await addItem("test-edit-item-name", 0, "test-edit-item-category", "test-edit-item-id");
});

describe("Server Action: editItem()", () => {
  it("should return a 400 status if the id is missing", async () => {
    const response = await editItem("", {});
    expect(response.status).toBe(400);
  });

  it("should return a 500 status the edit field is empty", async () => {
    const response = await editItem("test-edit-item-id", {});
    expect(response.status).toBe(500);
  });

  it("should return a 200 status if the item is successfully edited", async () => {
    const response = await editItem("test-edit-item-id", { price: 1 });
    expect(response.status).toBe(200);
    expect(response.data?.price).toBe(1);
  });

  it("should return a 200 status if the item is successfully edited with a different field", async () => {
    const response = await editItem("test-edit-item-id", { category: "test-edit-item-category-2" });
    expect(response.status).toBe(200);
    expect(response.data?.category).toBe("test-edit-item-category-2");
  });

  it("should return a 200 status if the item is successfully edited with multiple fields", async () => {
    const response = await editItem("test-edit-item-id", { price: 2, category: "test-edit-item-category-3" });
    expect(response.status).toBe(200);
    expect(response.data?.price).toBe(2);
    expect(response.data?.category).toBe("test-edit-item-category-3");
  });

  /** Calling a dynamodb update command on a nonexistent item will create the item */
  it("should return a 200 status if the item does not exist", async () => {
    const response = await editItem("test-edit-item-id-2", { price: 1 });
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.price).toBe(1);
  });
});

afterAll(async () => {
  /** Delete the items */
  await deleteItem("test-edit-item-id");
  await deleteItem("test-edit-item-id-2");
});
