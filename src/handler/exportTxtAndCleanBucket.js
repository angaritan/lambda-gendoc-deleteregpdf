const {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} = require("@aws-sdk/client-s3");
const { s3 } = require("../config/awsConfig");
const {
  scanAllItems,
  deleteItemsInBatches,
} = require("../utils/dynamoHelper.js");
const { sendFileToS3, getPdfFiles, deleteS3File } = require("../utils/s3Helper.js");

const handler = async () => {
  try {
    // 1. Leer todos los ítems de la tabla
    const allItems = await scanAllItems();
    console.log(`Total ítems DynamoDB: ${allItems.length}`);

    // 2. Construir contenido del archivo
    const contenidoFinal = allItems
      .map((item) => item.fila_consolidada || "")
      .filter((linea) => linea !== "")
      .join("\n");

    await sendFileToS3(contenidoFinal);
    
    // 4. Eliminar PDFs del bucket de entrada
    const pdfs = await getPdfFiles();    

    const CHUNK_SIZE = 1000;
    for (let i = 0; i < pdfs.length; i += CHUNK_SIZE) {
      const objectsToDelete = pdfs.slice(i, i + CHUNK_SIZE);
      await deleteS3File(objectsToDelete);
    }

    // 5. Eliminar ítems de DynamoDB
    await deleteItemsInBatches(allItems);
    console.log("🧹 Ítems DynamoDB eliminados.");

    return {
      statusCode: 200,
      body: `Proceso completado: ${allItems.length} registros exportados, ${pdfs.length} PDFs eliminados.`,
    };
  } catch (err) {
    console.error("Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

module.exports = {
  handler,
};
