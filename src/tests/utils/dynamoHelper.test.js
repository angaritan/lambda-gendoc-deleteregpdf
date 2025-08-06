const { mockClient } = require("aws-sdk-client-mock");
const {
  DynamoDBDocumentClient,
  ScanCommand,
  BatchWriteCommand,
} = require("@aws-sdk/lib-dynamodb");

const { scanAllItems, deleteItemsInBatches } = require("../../utils/dynamoHelper");

jest.mock("../../utils/ssmHelper", () => ({
  getParameter: jest.fn().mockResolvedValue("TestTable"),
}));

const dynamoMock = mockClient(DynamoDBDocumentClient);

describe("dynamoHelper", () => {
  beforeEach(() => {
    dynamoMock.reset();
  });

  it("should scan all items in pages", async () => {
    dynamoMock
      .on(ScanCommand)
      .resolvesOnce({
        Items: [{ documentId: "1", fechaProceso: "a" }],
        LastEvaluatedKey: { documentId: "1" },
      })
      .resolvesOnce({
        Items: [{ documentId: "2", fechaProceso: "b" }],
        LastEvaluatedKey: undefined,
      });

    const result = await scanAllItems();

    expect(result).toHaveLength(2);
    expect(dynamoMock.commandCalls(ScanCommand).length).toBe(2);
  });

  it("should delete items in batches of 25", async () => {
    const items = Array.from({ length: 50 }, (_, i) => ({
      documentId: `pk${i}`,
      fechaProceso: `sk${i}`,
    }));

    dynamoMock.on(BatchWriteCommand).resolves({});

    await deleteItemsInBatches(items);

    expect(dynamoMock.commandCalls(BatchWriteCommand).length).toBe(2);
  });
});
