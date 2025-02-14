import { CreateTableCommand, DeleteTableCommand } from "@aws-sdk/client-dynamodb";
import { addItem } from "../../components/inventory/actions/addItem.ts";
import { deleteItem } from "../../components/inventory/actions/deleteItem.ts";
import { getInventory } from "../../components/inventory/actions/getInventory.ts";
import { getDynamoDBDocumentClient } from "../../lib/aws/dynamodb/getDynamoDBDocumentClient.ts";
import editItem from "../../components/inventory/actions/editItem.ts";

/** Ensure the function works (without any parameters) and if adding and removing of items work */
beforeAll(async () => {
  try {
    /** Set the TABLE_NAME environment variable */
    process.env.TABLE_NAME = "TestInventory";

    /** Create the table */
    const ddbdClient = getDynamoDBDocumentClient();
    const createTableCommand = new CreateTableCommand({
      TableName: "TestInventory",
      AttributeDefinitions: [
        {
          AttributeName: "id",
          AttributeType: "S",
        },
      ],
      KeySchema: [
        {
          AttributeName: "id",
          KeyType: "HASH",
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      },
    });
    await ddbdClient.send(createTableCommand);

    const inventoryResponse = await getInventory();
    expect(inventoryResponse.status).toBe(200);
    const addItemResponse = await addItem("Test Item", 100, "Test Category", "test-item-id");
    expect(addItemResponse.status).toBe(200);
    const editItemResponse = await editItem("test-item-id", { name: "Test Item", price: 200, category: "Test Category" });
    expect(editItemResponse.status).toBe(200);
    expect(editItemResponse.data?.price).toBe(200);
    const deleteItemResponse = await deleteItem("test-item-id");
    expect(deleteItemResponse.status).toBe(200);

    /** If there are existing inventory items, do not proceed
     *  with the tests.
     *  The user might have loaded the app with a live database and could
     *  cause potential data loss.
     */
    if (inventoryResponse.data?.items && inventoryResponse.data?.items.length > 0) {
      throw new Error("[beforeAll] Found existing inventory items. Please remove them or switch to a test database");
    }
  } catch (error) {
    console.error("[beforeAll] beforeAll failed, unable to continue with test");
    throw error;
  }
});

/** Delete the table
 *  IMPORTANT:
 *  The table name is hardcoded here, incase the environment variable was
 *  somehow changed during the tests, it would still delete the correct table
 */
afterAll(async () => {
  try {
    const ddbdClient = getDynamoDBDocumentClient();
    await ddbdClient.send(new DeleteTableCommand({ TableName: "TestInventory" }));
  } catch (error) {
    console.error("[afterAll] afterAll failed, unable to continue with test. Please delete the table manually");
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
    const response = await getInventory({ category: "Test Category" });
    expect(response.status).toBe(200);
  });

  /** Expect a 200 status when category is not provided */
  it("should return a 200 status if is not provided", async () => {
    const response = await getInventory();
    expect(response.status).toBe(200);
  });

  /** Expect 3 items when category is provided */
  it("should find 3 test items when category is provided", async () => {
    await addItem("Test Item 1", 100, "Test Category", "test-item-id-1");
    await addItem("Test Item 2", 100, "Test Category", "test-item-id-2");
    await addItem("Test Item 3", 100, "Test Category", "test-item-id-3");
    try {
      const response = await getInventory({ category: "Test Category" });
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data?.items).toBeDefined();
      expect(response.data?.items.length).toBe(3);
    } catch (error) {
      throw error;
    }
  });

  /** Expect 3 items when category provided does not contain items with the category */
  it("should not find any test items when category is not provided", async () => {
    /** Add an item with a different category */
    await addItem("Test Item", 100, "Different Category", "test-item-id");
    const response = await getInventory({ category: "Test Category" });
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.items).toBeDefined();
    expect(response.data?.items.length).toBe(3);
  });

  /** Expect 4 items when no category is provided */
  it("should find 4 test items when no category is provided", async () => {
    const response = await getInventory();
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.items).toBeDefined();
    expect(response.data?.items.length).toBe(4);
  });

  /** Expect 1 item when dt_from is provided */
  it("should find 1 test item when dt_from is provided", async () => {
    /** Add an item and change its updated date */
    await addItem("Test Item", 100, "Test Category", "test-item-id"); // This should technically do nothing
    await editItem("test-item-id", { last_updated_dt: "3000-01-01 00:00:00 +08:00" });
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
    /** Add an item and change its updated date */
    await addItem("Test Item", 100, "Test Category", "test-item-id"); // This should technically do nothing
    await editItem("test-item-id", { last_updated_dt: "1000-01-01 00:00:00 +08:00" });
    const response = await getInventory({
      dt_to: "1001-01-01",
    });
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data?.items).toBeDefined();
    expect(response.data?.items.length).toBe(1);
  });

  ///it("should find a test item when category is provided", async () => {});
  // it("should find a test item when category is provided", async () => {
  //   const response = await getInventory(undefined, undefined, ["Test Category"]);
  //   expect(response.status).toBe(200);
  //   expect(response.data).toBeDefined();
  //   expect(response.data?.items).toBeDefined();
  //   expect(response.data?.items.length).toBeGreaterThan(0);
  //   expect(response.data?.items.find((item) => item.name === "Test Item")).toBeDefined();
  // });

  // /** Add an item to the database */
  // beforeAll(async () => {
  //   try {
  //     const response = await addItem("Test Item", 100, "Test Category");
  //     expect(response.status).toBe(200);
  //   } catch (error) {
  //     console.error("[beforeAll] beforeAll failed, unable to continue with tests", error);
  //     throw error;
  //   }
  // });
  // it("should return a 200 status with items", async () => {
  //   const response = await getInventory();
  //   expect(response.status).toBe(200);
  //   expect(response.data).toBeDefined();
  //   expect(response.data?.items).toBeDefined();
  //   expect(response.data?.items.length).toBeGreaterThan(0);
  // });
  // /** Delete the item from the database */
  // afterAll(async () => {
  //   try {
  //     const response = await getInventory();
  //     const id = response.data?.items.find((item) => item.name === "Test Item")?.id;
  //     expect(id).toBeDefined();
  //     const deleteResponse = await deleteItem(id!);
  //     expect(deleteResponse.status).toBe(200);
  //   } catch (error) {
  //     console.error("[afterAll] afterAll failed, unable to continue with tests. Please delete the item manually", error);
  //     throw error;
  //   }
  // });
});
