const { ssm } = require("../../config/awsConfig");
const { getParameter } = require('../../utils/ssmHelper');

jest.mock("../../config/awsConfig", () => ({
  ssm: {
    getParameter: jest.fn(),
  },
}));

describe("getParameter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should call ssm.getParameter and return the parameter value", async () => {
    const mockPromise = jest.fn().mockResolvedValue({
      Parameter: {
        Value: "mocked-value",
      },
    });
    ssm.getParameter.mockReturnValue({ promise: mockPromise });

    const paramName = "my-param";
    const value = await getParameter(paramName);

    expect(ssm.getParameter).toHaveBeenCalledWith({
      Name: `/gen-delete/configuration/${paramName}`,
      WithDecryption: false,
    });
    expect(mockPromise).toHaveBeenCalled();
    expect(value).toBe("mocked-value");
  });

  test("should throw if ssm.getParameter rejects", async () => {
    const mockPromise = jest.fn().mockRejectedValue(new Error("AWS error"));
    ssm.getParameter.mockReturnValue({ promise: mockPromise });

    await expect(getParameter("any-param")).rejects.toThrow("AWS error");
  });
});
