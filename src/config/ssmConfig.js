const { ssm } = require('./awsConfig')

const getParameter = async(nameParameter) => {
    const result = await ssm.getParameter({
        Name: `/textract-load/configuration/${nameParameter}`,
        WithDecryption: false,
    }).promise();

    return result.Parameter.Value;
};

module.exports = {
    getParameter
};
