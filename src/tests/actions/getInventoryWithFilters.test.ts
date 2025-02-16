import { addItem } from "../../components/inventory/actions/addItem.ts";
import { getInventoryWithFilters } from "../../components/inventory/actions/getInventoryWithFilters.ts";
import editItem from "../../components/inventory/actions/editItem.ts";
import clearInventory from "../../components/inventory/actions/clearInventory.ts";

/** This technically also tests the other functions, but theres a separate test file for that */
beforeAll(async () => {
  try {
    /** Add 50 Testing Items
     *  General format for test items
     *  <test-filters-item-name-*> <test-filters-category-*> <test-filters-item-id-*>
     *  1 item whose last_updated_dt is "3000-01-01 00:00:00 +08:00"
     *  1 item whose last_updated_dt is "1000-01-01 00:00:00 +08:00"
     */

    /** Add the items */
    for (let i = 0; i < 50; i++) {
      /** Variables */
      const itemId = `test-filters-item-id-${i}`;
      const itemName = `test-filters-item-name-${i}`;
      let itemPrice = i;
      let itemCategory = "unknown-category";

      if (i < 1) {
        itemCategory = "test-filters-category-1";
      } else if (i < 11) {
        itemCategory = "test-filters-category-2";
      } else if (i < 31) {
        itemCategory = "test-filters-category-3";
      }

      /** Add the item */
      await addItem(itemName, itemPrice, itemCategory, itemId);
    }

    /** Edit 2 items to have different last updated dates */
    await editItem("test-filters-item-id-3", { last_updated_dt: "3000-01-01 00:00:00 +08:00" });
    await editItem("test-filters-item-id-4", { last_updated_dt: "1000-01-01 00:00:00 +08:00" });
  } catch (error) {
    console.error("[beforeAll] beforeAll failed, unable to continue with test");
    throw error;
  }
});

/** IMPORTANT:
 *  Category has been shifted into "filters" for getInventoryWithFilters
 */

describe("Server Action: getInventoryWithFilters()", () => {
  /** Expect an error when dt_from > dt_to */
  it("should fail with a 400 status if dt_from is greater than dt_to", async () => {
    const response = await getInventoryWithFilters({
      dt_from: "2022-01-01",
      dt_to: "2021-01-01",
    });
    expect(response.status).toBe(400);
  });

  /** Expect a 200 status when dt_from < dt_to */
  it("should return a 200 status if dt_from is less than dt_to", async () => {
    const response = await getInventoryWithFilters({
      dt_from: "2021-01-01",
      dt_to: "2022-01-01",
    });
    expect(response.status).toBe(200);
  });

  /** Expect a 200 status when category is provided */
  it("should return a 200 status if category is provided", async () => {
    const response = await getInventoryWithFilters({ filters: { category: "unknown-category" } });
    expect(response.status).toBe(200);
  });

  /** Expect a 200 status when category is not provided */
  it("should return a 200 status if is not provided", async () => {
    const response = await getInventoryWithFilters();
    expect(response.status).toBe(200);
  });

  /** Expect 1 item when category is provided */
  it("should find 1 test item when category is provided", async () => {
    const response = await getInventoryWithFilters({ filters: { category: "test-filters-category-1" } });
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.items).toBeDefined();
    expect(response.data?.items.length).toBe(1);
  });

  /** Expect 0 items when category provided does not exists */
  it("should not find any test items when category is provided is non-existent", async () => {
    const response = await getInventoryWithFilters({ filters: { category: "fake-category" } });
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.items).toBeDefined();
    expect(response.data?.items.length).toBe(0);
  });

  /** Expect 50 items when no category is provided */
  it("should find 50 test items when no category is provided", async () => {
    const response = await getInventoryWithFilters();
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.items).toBeDefined();
    expect(response.data?.items.length).toBe(50);
  });

  /** Expect 1 item when dt_from is provided */
  it("should find 1 test item when dt_from is provided", async () => {
    const response = await getInventoryWithFilters({
      dt_from: "2999-01-01",
    });
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.items).toBeDefined();
    expect(response.data?.items.length).toBe(1);
  });

  /** Expect 1 item when dt_to is provided */
  it("should find 1 test item when dt_to is provided", async () => {
    const response = await getInventoryWithFilters({
      dt_to: "1001-01-01",
    });
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.items).toBeDefined();
    expect(response.data?.items.length).toBe(1);
  });

  /** Expect 0 items when dt_from and dt_to are provided but no items exist */
  it("should not find any test items when dt_from and dt_to are provided but no items exist", async () => {
    const response = await getInventoryWithFilters({
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
    const response = await getInventoryWithFilters({
      dt_from: "invalid-date",
      dt_to: "invalid-date",
      filters: { price_range: [1] },
      pagination: { page: -1, limit: -1 },
      sort: { field: "", order: "fake-order" },
    });
    expect(response.status).toBe(400);
  });

  /** The above tests are a subset of getInventory tests
   *  The below tests are now specific for getInventoryWithFilters
   */

  /** Expect 50 items when filters name is provided
   *  - It searches for the name in the item name
   */
  it("should find 50 test items when filters name is provided", async () => {
    const response = await getInventoryWithFilters({
      filters: { name: "test-filters-item-name" },
    });
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.items).toBeDefined();
    expect(response.data?.items.length).toBe(50);
  });

  /** Expect 11 item when filters name is provided
   *  NOTE: We added 11 items because we have item-name<1,10-19> in the test items
   */
  it("should find 11 test item when filters name is provided", async () => {
    const response = await getInventoryWithFilters({
      filters: { name: "test-filters-item-name-1" },
    });
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.items).toBeDefined();
    expect(response.data?.items.length).toBe(11);
  });

  /** Expect 3 items when price_range is provided */
  it("should find 1 test item when price_range is provided", async () => {
    const response = await getInventoryWithFilters({
      filters: { price_range: [1, 3] },
    });
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.items).toBeDefined();
    expect(response.data?.items.length).toBe(3);
  });

  /** Expect 0 items when the price range is out of range */
  it("should not find any test items when price_range is out of range", async () => {
    const response = await getInventoryWithFilters({
      filters: { price_range: [100, 200] },
    });
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.items).toBeDefined();
    expect(response.data?.items.length).toBe(0);
  });

  /** Expect an error if price range before > after */
  it("should fail with a 400 status if price_range from is greater than price_range to", async () => {
    const response = await getInventoryWithFilters({
      filters: { price_range: [3, 1] },
    });
    expect(response.status).toBe(400);
  });

  /** Expect 10 items when pagination is provided */
  it("should find 10 test items when pagination is provided", async () => {
    const response = await getInventoryWithFilters({
      pagination: { page: 1, limit: 10 },
    });
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.items).toBeDefined();
    expect(response.data?.items.length).toBe(10);
  });

  /** Expect 10 items when pagination is provided on a separate page*/
  it("should find 10 test items when pagination is provided on a separate page", async () => {
    const response = await getInventoryWithFilters({
      pagination: { page: 2, limit: 10 },
    });
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.items).toBeDefined();
    expect(response.data?.items.length).toBe(10);
  });

  /** Expect 20 items when the pagination limit is different */
  it("should find 20 test items when pagination limit is different", async () => {
    const response = await getInventoryWithFilters({
      pagination: { page: 1, limit: 20 },
    });
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.items).toBeDefined();
    expect(response.data?.items.length).toBe(20);
  });

  /** Expect 0 items when the pagination page is over the limit */
  it("should not find any test items when pagination page is over the limit", async () => {
    const response = await getInventoryWithFilters({
      pagination: { page: 6, limit: 10 },
    });
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.items).toBeDefined();
    expect(response.data?.items.length).toBe(0);
  });

  /** Expect 50 items when the pagination limit is over the total items */
  it("should find 50 test items when pagination limit is over the total items", async () => {
    const response = await getInventoryWithFilters({
      pagination: { page: 1, limit: 100 },
    });
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.items).toBeDefined();
    expect(response.data?.items.length).toBe(50);
  });

  /** Expect an error if the pagination inputs are invalid */
  it("should fail with a 400 status if pagination inputs are invalid", async () => {
    const response = await getInventoryWithFilters({
      pagination: { page: -1, limit: -1 },
    });
    expect(response.status).toBe(400);
  });

  /** Expect 50 items sorted in ascending order */
  it("should find 50 test items sorted in ascending order", async () => {
    const response = await getInventoryWithFilters({
      sort: { field: "price", order: "asc" },
    });
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.items).toBeDefined();
    expect(response.data?.items.length).toBe(50);
    expect(response.data?.items[0].price).toBe(0);
    expect(response.data?.items[49].price).toBe(49);
  });

  /** Expect 50 items sorted in descending order */
  it("should find 50 test items sorted in descending order", async () => {
    const response = await getInventoryWithFilters({
      sort: { field: "price", order: "desc" },
    });
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.items).toBeDefined();
    expect(response.data?.items.length).toBe(50);
    expect(response.data?.items[0].price).toBe(49);
    expect(response.data?.items[49].price).toBe(0);
  });

  /** Expect 50 items sorted by last_updated_dt in ascending order */
  it("should find 50 test items sorted by last_updated_dt in ascending order", async () => {
    const response = await getInventoryWithFilters({
      sort: { field: "last_updated_dt", order: "asc" },
    });
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.items).toBeDefined();
    expect(response.data?.items.length).toBe(50);
    expect(response.data?.items[0].last_updated_dt).toBe("1000-01-01 00:00:00 +08:00");
    expect(response.data?.items[49].last_updated_dt).toBe("3000-01-01 00:00:00 +08:00");
  });

  /** Advanced Filtering */
  it("should find 10 test items with advanced filtering", async () => {
    const response = await getInventoryWithFilters({
      dt_from: "0000-01-01",
      dt_to: "9999-01-01",
      filters: { category: "test-filters-category-2" },
      pagination: { page: 1, limit: 50 }, // Due to the way pagination works, it specifically requests a page from ddb, but it might not be in order
      sort: { field: "price", order: "asc" },
    });
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.items).toBeDefined();
    expect(response.data?.items.length).toBe(10);
    expect(response.data?.items[0].price).toBe(1);
    expect(response.data?.items[9].price).toBe(10);
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
