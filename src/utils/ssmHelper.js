const { ssm } = require('../config/awsConfig')

const getParameter = async(nameParameter) => {
    const result = await ssm.getParameter({
        Name: `/gen-delete/configuration/${nameParameter}`,
        WithDecryption: false,
    }).promise();

    return result.Parameter.Value;
};

module.exports = {
    getParameter
};
