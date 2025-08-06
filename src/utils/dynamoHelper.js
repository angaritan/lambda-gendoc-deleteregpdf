const {
  ScanCommand,
  BatchWriteCommand,
} = require("@aws-sdk/lib-dynamodb");
const { dynamodb } = require("../config/awsConfig");
const { getParameter } = require("./ssmHelper");

async function scanAllItems() {
  const tableName = await getParameter("aws.dynamo.table-name-consolidated");
  console.log(`TableName: ${tableName}`);

  let allItems = [];
  let ExclusiveStartKey;

  do {
    const result = await dynamodb.send(
      new ScanCommand({
        TableName: tableName,
        ExclusiveStartKey,
      })
    );
    allItems = allItems.concat(result.Items);
    ExclusiveStartKey = result.LastEvaluatedKey;
  } while (ExclusiveStartKey);

  return allItems;
}

async function deleteItemsInBatches(items) {
  const tableName = await getParameter("aws.dynamo.table-name-consolidated");

  for (let i = 0; i < items.length; i += 25) {
    const batch = items.slice(i, i + 25);
    const deleteRequests = batch.map((item) => ({
      DeleteRequest: {
        Key: {
          documentId: item.documentId,
          fechaProceso: item.fechaProceso
        },
      },
    }));

    await dynamodb.send(
      new BatchWriteCommand({
        RequestItems: {
          [tableName]: deleteRequests,
        },
      })
    );
    console.log(`🧹 Eliminados ${deleteRequests.length} ítems`);
  }
}

module.exports = {
  scanAllItems,
  deleteItemsInBatches,
};
