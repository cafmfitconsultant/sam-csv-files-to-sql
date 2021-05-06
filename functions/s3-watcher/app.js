const aws = require('aws-sdk');

exports.lambdaHandler = async (event, context) => {
    console.log('event ', event);
    console.log('context ', context);
    const { Records } = event;
    const [item] = Records;
    const { s3: { bucket: { name }, object: { key } } } = item;
    const params = {
        stateMachineArn: process.env.statemachine_arn,
        input: JSON.stringify({
            file: `${key}`
        })
    };
    try {
        const stepfunctions = new aws.StepFunctions();
        const result = await stepfunctions.startExecution(params).promise();
        console.log('result : ', result);
    } catch (error) {
        console.log(error);
    }
};
