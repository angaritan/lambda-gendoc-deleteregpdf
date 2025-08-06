const { handler } = require('../../handler/exportTxtAndCleanBucket.js');

jest.mock('../../utils/dynamoHelper.js', () => ({
  scanAllItems: jest.fn(),
  deleteItemsInBatches: jest.fn(),
}));
jest.mock('../../utils/s3Helper.js', () => ({
  sendFileToS3: jest.fn(),
  getPdfFiles: jest.fn(),
  deleteS3File: jest.fn(),
}));

const {
  scanAllItems,
  deleteItemsInBatches,
} = require('../../utils/dynamoHelper.js');
const {
  sendFileToS3,
  getPdfFiles,
  deleteS3File,
} = require('../../utils/s3Helper.js');

describe('handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process correctly and return status 200', async () => {
    const mockItems = [
      { fila_consolidada: 'line1' },
      { fila_consolidada: 'line2' },
      { fila_consolidada: '' },
    ];
    scanAllItems.mockResolvedValue(mockItems);
    sendFileToS3.mockResolvedValue();
    const mockPdfs = [
      { Key: 'file1.pdf' },
      { Key: 'file2.pdf' },
    ];
    getPdfFiles.mockResolvedValue(mockPdfs);
    deleteS3File.mockResolvedValue();
    deleteItemsInBatches.mockResolvedValue();

    const result = await handler();

    expect(scanAllItems).toHaveBeenCalled();
    expect(sendFileToS3).toHaveBeenCalledWith('line1\nline2');
    expect(getPdfFiles).toHaveBeenCalled();
    expect(deleteS3File).toHaveBeenCalledWith(mockPdfs);
    expect(deleteItemsInBatches).toHaveBeenCalledWith(mockItems);

    expect(result.statusCode).toBe(200);
    expect(result.body).toContain(`${mockItems.length} registros exportados`);
    expect(result.body).toContain(`${mockPdfs.length} PDFs eliminados`);
  });

  it('should handle errors and return status 500', async () => {
    const errorMsg = 'some error';
    scanAllItems.mockRejectedValue(new Error(errorMsg));

    const result = await handler();

    expect(result.statusCode).toBe(500);
    expect(result.body).toContain(errorMsg);
  });
});
