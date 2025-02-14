describe("addItem", () => {
  it("should add an item to the inventory", async () => {
    // Arrange
    const name = "Test Item";
    const price = 100;
    const category = "Test Category";

    const ddbdClient = new DynamoDBDocumentClient({});

    // Act
    const response = await addItemFA(ddbdClient, name, price, category);

    // Assert
    expect(response.status).toBe(200);
    expect(response.message).toBe("[addItem] Success");
    expect(response.data).toBeDefined();
    expect(response.data?.name).toBe(name);
    expect(response.data?.price).toBe(price);
    expect(response.data?.category).toBe(category);
  });
}