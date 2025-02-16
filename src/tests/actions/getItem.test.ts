import { addItem } from "../../components/inventory/actions/addItem.ts";
import { deleteItem } from "../../components/inventory/actions/deleteItem.ts";
import getItem from "../../components/inventory/actions/getItem.ts";

beforeAll(async () => {
  /** Add an item to get */
  await addItem("test-get-item-name", 0, "test-get-item-category", "test-get-item-id");
});

describe("Server Action: getItem()", () => {
  it("should return a 400 status if the id is missing", async () => {
    const response = await getItem("");
    expect(response.status).toBe(400);
  });

  it("should return a 404 status if the item does not exist", async () => {
    const response = await getItem("test-get-item-id-2");
    expect(response.status).toBe(404);
  });

  it("should return a 200 status if the item exists", async () => {
    const response = await getItem("test-get-item-id");
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.name).toBe("test-get-item-name");
  });
});

afterAll(async () => {
  /** Delete the item */
  await deleteItem("test-get-item-id");
});
