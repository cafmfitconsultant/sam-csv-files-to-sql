exports.lambdaHandler = async (event, context) => {
    console.log('data-transformer');
    console.log('event : ', event);
    console.log('context', context);
    return 2;
};
