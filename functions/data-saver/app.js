
const { transactionalSaveBatchData } = require('./db-wrapper');

exports.lambdaHandler = async (event) => {
    console.log('data-saver');
    console.log('event : ', event);
    const { bucketName, currentFolder, jsonFiles } = event;
    await transactionalSaveBatchData(bucketName,currentFolder,jsonFiles);
};
