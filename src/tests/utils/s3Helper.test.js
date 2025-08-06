const { sendFileToS3, getPdfFiles, deleteS3File } = require('../../utils/s3Helper');
const { s3 } = require('../../config/awsConfig');
const { getParameter } = require('../../utils/ssmHelper');

jest.mock('../../config/awsConfig', () => ({
  s3: {
    putObject: jest.fn(() => ({ promise: jest.fn() })),
    listObjectsV2: jest.fn(() => ({ promise: jest.fn() })),
    deleteObjects: jest.fn(() => ({ promise: jest.fn() })),
  },
}));

jest.mock('../../utils/ssmHelper', () => ({
  getParameter: jest.fn(),
}));

describe('S3 Helper functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('sendFileToS3 calls s3.putObject with correct params', async () => {
    getParameter.mockResolvedValue('my-bucket');
    const mockPromise = jest.fn().mockResolvedValue({});
    s3.putObject.mockReturnValue({ promise: mockPromise });

    const content = 'file content';
    await sendFileToS3(content);

    expect(getParameter).toHaveBeenCalledWith('aws.s3.bucket-salida-textract');
    expect(s3.putObject).toHaveBeenCalledWith(expect.objectContaining({
      Bucket: 'my-bucket',
      Body: content,
      ContentType: 'text/plain',
    }));
    expect(mockPromise).toHaveBeenCalled();
  });

  test('getPdfFiles returns only pdf files', async () => {
    getParameter.mockResolvedValue('my-bucket');
    const contents = [
      { Key: 'file1.pdf' },
      { Key: 'file2.txt' },
      { Key: 'folder/file3.pdf' },
    ];
    const mockPromise = jest.fn().mockResolvedValue({ Contents: contents });
    s3.listObjectsV2.mockReturnValue({ promise: mockPromise });

    const result = await getPdfFiles();

    expect(getParameter).toHaveBeenCalledWith('aws.s3.bucket-salida-textract');
    expect(s3.listObjectsV2).toHaveBeenCalledWith({ Bucket: 'my-bucket' });
    expect(mockPromise).toHaveBeenCalled();
    expect(result).toEqual([
      { Key: 'file1.pdf' },
      { Key: 'folder/file3.pdf' },
    ]);
  });

  test('deleteS3File calls s3.deleteObjects with correct params', async () => {
    getParameter.mockResolvedValue('my-bucket');
    const mockPromise = jest.fn().mockResolvedValue({});
    s3.deleteObjects.mockReturnValue({ promise: mockPromise });

    const filesToDelete = [{ Key: 'file1.pdf' }, { Key: 'file2.pdf' }];
    await deleteS3File(filesToDelete);

    expect(getParameter).toHaveBeenCalledWith('aws.s3.bucket-salida-textract');
    expect(s3.deleteObjects).toHaveBeenCalledWith({
      Bucket: 'my-bucket',
      Delete: {
        Objects: filesToDelete.map(({ Key }) => ({ Key })),
        Quiet: true,
      },
    });
    expect(mockPromise).toHaveBeenCalled();
  });
});