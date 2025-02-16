import { addItem } from "../../components/inventory/actions/addItem.ts";
import { deleteItem } from "../../components/inventory/actions/deleteItem.ts";

describe("Server Action: addItem()", () => {
  it("should fail with 400 status if name is not provided", async () => {
    const response = await addItem("", 0, "fake-add-item-category");
    expect(response.status).toBe(400);
  });

  it("should fail with 400 status if price is not a number", async () => {
    const response = await addItem("test-add-item", NaN, "fake-add-item-category");
    expect(response.status).toBe(400);
  });

  it("should fail with 400 status if category is not provided", async () => {
    const response = await addItem("test-add-item", 0, "");
    expect(response.status).toBe(400);
  });

  it("should return an item with 200 status if all required fields are provided", async () => {
    const response = await addItem("test-add-item", 0, "fake-add-item-category", "fake-add-item-id");
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data).toBe("fake-add-item-id");
  });

  it("should update an item if it already exists with the same name", async () => {
    const response = await addItem("test-add-item", 1, "fake-add-item-category"); // Id is not provided
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined(); // If any item is updated, the data should be defined
  });
});

afterAll(async () => {
  /** Remove the items added in this run */
  const response = await deleteItem("fake-add-item-id");
  expect(response.status).toBe(200);
});
