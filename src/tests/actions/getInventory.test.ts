import { addItem } from "../../components/inventory/actions/addItem.ts";
import { getInventory } from "../../components/inventory/actions/getInventory.ts";
import editItem from "../../components/inventory/actions/editItem.ts";
import clearInventory from "../../components/inventory/actions/clearInventory.ts";

/** This technically also tests the other functions, but theres a separate test file for that */
beforeAll(async () => {
  try {
    /** Add 50 Testing Items
     *  General format for test items
     *  <test-item-name-*> <test-category-*> <test-item-id-*>
     *  1 item whose last_updated_dt is "3000-01-01 00:00:00 +08:00"
     *  1 item whose last_updated_dt is "1000-01-01 00:00:00 +08:00"
     */

    /** Add the items */
    for (let i = 0; i < 50; i++) {
      /** Variables */
      const itemId = `test-item-id-${i}`;
      const itemName = `test-item-name-${i}`;
      let itemPrice = i;
      let itemCategory = "unknown-category";

      if (i < 1) {
        itemCategory = "test-category-1";
      } else if (i < 11) {
        itemCategory = "test-category-2";
      } else if (i < 31) {
        itemCategory = "test-category-3";
      }

      /** Add the item */
      await addItem(itemName, itemPrice, itemCategory, itemId);
    }

    /** Edit 2 items to have different last updated dates */
    await editItem("test-item-id-3", { last_updated_dt: "3000-01-01 00:00:00 +08:00" });
    await editItem("test-item-id-4", { last_updated_dt: "1000-01-01 00:00:00 +08:00" });
  } catch (error) {
    console.error("[beforeAll] beforeAll failed, unable to continue with test");
    throw error;
  }
});

describe("Server Action: getInventory()", () => {
  /** Expect an error when dt_from > dt_to */
  it("should fail with a 400 status if dt_from is greater than dt_to", async () => {
    const response = await getInventory({
      dt_from: "2022-01-01",
      dt_to: "2021-01-01",
    });
    expect(response.status).toBe(400);
  });

  /** Expect a 200 status when dt_from < dt_to */
  it("should return a 200 status if dt_from is less than dt_to", async () => {
    const response = await getInventory({
      dt_from: "2021-01-01",
      dt_to: "2022-01-01",
    });
    expect(response.status).toBe(200);
  });

  /** Expect a 200 status when category is provided */
  it("should return a 200 status if category is provided", async () => {
    const response = await getInventory({ category: "unknown-category" });
    expect(response.status).toBe(200);
  });

  /** Expect a 200 status when category is not provided */
  it("should return a 200 status if is not provided", async () => {
    const response = await getInventory();
    expect(response.status).toBe(200);
  });

  /** Expect 1 item when category is provided */
  it("should find 1 test item when category is provided", async () => {
    const response = await getInventory({ category: "test-category-1" });
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.items).toBeDefined();
    expect(response.data?.items.length).toBe(1);
  });

  /** Expect 0 items when category provided does not exists */
  it("should not find any test items when category is provided is non-existent", async () => {
    const response = await getInventory({ category: "fake-category" });
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.items).toBeDefined();
    expect(response.data?.items.length).toBe(0);
  });

  /** Expect 50 items when no category is provided */
  it("should find 50 test items when no category is provided", async () => {
    const response = await getInventory();
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.items).toBeDefined();
    expect(response.data?.items.length).toBe(50);
  });

  /** Expect 1 item when dt_from is provided */
  it("should find 1 test item when dt_from is provided", async () => {
    const response = await getInventory({
      dt_from: "2999-01-01",
    });
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.items).toBeDefined();
    expect(response.data?.items.length).toBe(1);
  });

  /** Expect 1 item when dt_to is provided */
  it("should find 1 test item when dt_to is provided", async () => {
    const response = await getInventory({
      dt_to: "1001-01-01",
    });
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.items).toBeDefined();
    expect(response.data?.items.length).toBe(1);
  });

  /** Expect 0 items when dt_from and dt_to are provided but no items exist */
  it("should not find any test items when dt_from and dt_to are provided but no items exist", async () => {
    const response = await getInventory({
      dt_from: "1001-01-01",
      dt_to: "1002-01-01",
    });
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.items).toBeDefined();
    expect(response.data?.items.length).toBe(0);
  });

  /** Expect error when any of the inputs are invalid */
  it("should fail with a 400 status if any of the inputs are invalid", async () => {
    const response = await getInventory({
      dt_from: "invalid-date",
      dt_to: "invalid-date",
      category: "",
    });
    expect(response.status).toBe(400);
  });
});

afterAll(async () => {
  try {
    /** Clear the inventory */
    await clearInventory();
  } catch (error) {
    console.error("[afterAll] afterAll failed, unable to continue with test");
    throw error;
  }
});
