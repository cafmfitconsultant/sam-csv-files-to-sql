const aws = require('aws-sdk');
const s3 = new aws.S3();
const localidadeParserParameters = {
    delimiter: "@",
    headers: ["LOC_NU", "UFE_SG", "LOC_NO", "CEP", "LOC_IN_SIT", 
    "LOC_IN_TIPO_LOC", "LOC_NU_SUB", "LOC_NO_ABREV","MUN_NU","LOC_OPERACAO",
    "CEP_ANT"],
    checkColumn: true,
};
const csv = require('csvtojson');
const converter = csv(localidadeParserParameters);
exports.lambdaHandler = async (event) => {
    console.log('event: ', event);
    const { result: { bucketName } } = event;
    const getParams = {
        Bucket: bucketName,
        Key: 'eDNE_Delta_Basico_2102/raw/DELTA_LOG_LOCALIDADE.csv',
    };
    try {
        const { Body: buffer } = await s3.getObject(getParams).promise();
        const csvStr = buffer.toString('utf-8');
        const jsonArray = await converter.fromString(csvStr);
        console.log('jsonArray', jsonArray);
    } catch (error) {
        console.log(error);
    }

};
