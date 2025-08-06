const { s3 } = require("../config/awsConfig");
const { getParameter } = require("./ssmHelper");

async function sendFileToS3(content) {
  const bucketName = await getParameter("aws.s3.bucket-salida-textract");
  const key = getFileConsolidatedKey();
  await s3
    .putObject({
      Bucket: bucketName,
      Key: key,
      Body: content,
      ContentType: "text/plain",
    })
    .promise();
  console.log(`Archivo exportado: s3://${bucketName}/${key}`);
}

function getFileConsolidatedKey() {
  // Obtener timestamp formateado como YYYY-MM-DD_HH-mm
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const hour = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const timestamp = `${date}_${hour}-${minutes}`;
  return `resultados/CertificadosCDTDeceval_${timestamp}.txt`;
}

async function getPdfFiles() {
  const bucketName = await getParameter("aws.s3.bucket-salida-textract");

  const listResult = await s3.listObjectsV2({ Bucket: bucketName }).promise();
  console.log(`Total files in bucket: ${listResult.Contents.length}`);
  const pdfs = (listResult.Contents || []).filter((obj) =>
    obj.Key.endsWith(".pdf")
  );
  console.log(`Total Pdfs in bucket: ${pdfs.length}`);
  return pdfs;
}

async function deleteS3File(objectsToDelete) {
  const bucketName = await getParameter("aws.s3.bucket-salida-textract");

  await s3
    .deleteObjects({
      Bucket: bucketName,
      Delete: {
        Objects: objectsToDelete.map((obj) => ({ Key: obj.Key })),
        Quiet: true,
      },
    })
    .promise();
  console.log(`🗑️ Eliminados ${objectsToDelete.length} PDFs`);
}

module.exports = {
  sendFileToS3,
  getPdfFiles,
  deleteS3File,
};
