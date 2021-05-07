const aws = require('aws-sdk');
const unzipper = require("unzipper");
const iconv = require('iconv-lite');
const s3 = new aws.S3();

exports.lambdaHandler = async (event) => {
    const { Records } = event;
    const [item] = Records;
    const { s3: { bucket: { name: bucketName }, object: { key: orinalFileName } } } = item;   
    const directory = await unzipper.Open.s3(s3, { Bucket: bucketName, Key: orinalFileName });
    const currentFolder = orinalFileName.replace('zip/','').replace('.zip', '');
    const result = {bucketName, currentFolder, files: []};
    for (const file of directory.files) {
        const { path, type } = file;
        if (type === 'File' && path.startsWith('Delimitado/') && path.endsWith('.TXT')) {
            const buffer = await file.buffer();
            const fileName = path.replace('Delimitado/','').replace('.TXT','.csv');
            const key = `raw/${currentFolder}/${fileName}`;
            result.files.push(key);
            const body = iconv.decode(buffer, 'ISO-8859-1');
            const putParams = {
                Bucket: bucketName,
                Key: key,
                Body: body,
                ContentType: 'text/csv'
            }
            await s3.putObject(putParams).promise();
        }
    }
    console.log('result : ', result);
    const params = {
        stateMachineArn: process.env.statemachine_arn,
        input: JSON.stringify({
            result
        })
    };
    try {
        const stepfunctions = new aws.StepFunctions();
        await stepfunctions.startExecution(params).promise();
    } catch (error) {
        console.log(error);
    }
};
