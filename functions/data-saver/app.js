const aws = require('aws-sdk');
const s3 = new aws.S3();

const saveLogFaixaUF = async (jsonArray) => {
    console.log('saving faixa uf', jsonArray);
}

const saveLogLocalidade = async (jsonArray) => {
    console.log('saving localidade', jsonArray);
}

const saveLogFaixaLoc = async (jsonArray) => {
    console.log('saving faixa loc', jsonArray);
}

const saveLogBairro = async (jsonArray) => {
    console.log('saving bairro', jsonArray);
}

const saveLogFaixaBairro = async (jsonArray) => {
    console.log('saving faixa bairro', jsonArray);
}

const saveLogCPC = async (jsonArray) => {
    console.log('saving cpc', jsonArray);
}

const saveLogFaixaCPC = async (jsonArray) => {
    console.log('saving faixa cpc', jsonArray);
}

const saveLogLogradouro = async (jsonArray) => {
    console.log('saving logradouro', jsonArray);
}

const saveLogNumSec = async (jsonArray) => {
    console.log('saving num sec', jsonArray);
}

const saveLogGrandeUsuario = async (jsonArray) => {
    console.log('saving grande usuario', jsonArray);
}

const saveLogUnidOper = async (jsonArray) => {
    console.log('saving unid oper', jsonArray);
}

const saveLogFaixaUop = async (jsonArray) => {
    console.log('saving faixa uop', jsonArray);
}

const getFilesHandler = (currentFolder) => {
    const filesInfo = [
        { key: `json/${currentFolder}/DELTA_LOG_FAIXA_UF.json`, handler: saveLogFaixaUF },
        { key: `json/${currentFolder}/DELTA_LOG_LOCALIDADE.json`, handler: saveLogLocalidade },
        { key: `json/${currentFolder}/DELTA_LOG_FAIXA_LOC.json`, handler: saveLogFaixaLoc },
        { key: `json/${currentFolder}/DELTA_LOG_BAIRRO.json`, handler: saveLogBairro },
        { key: `json/${currentFolder}/DELTA_LOG_FAIXA_BAIRRO.json`, handler: saveLogFaixaBairro },
        { key: `json/${currentFolder}/DELTA_LOG_CPC.json`, handler: saveLogCPC },
        { key: `json/${currentFolder}/DELTA_LOG_FAIXA_CPC.json`, handler: saveLogFaixaCPC },
        { key: `json/${currentFolder}/DELTA_LOG_LOGRADOURO.json`, handler: saveLogLogradouro },
        { key: `json/${currentFolder}/DELTA_LOG_NUM_SEC.json`, handler: saveLogNumSec },
        { key: `json/${currentFolder}/DELTA_LOG_GRANDE_USUARIO.json`, handler: saveLogGrandeUsuario },
        { key: `json/${currentFolder}/DELTA_LOG_UNID_OPER.json`, handler: saveLogUnidOper },
        { key: `json/${currentFolder}/DELTA_LOG_FAIXA_UOP.json`, handler: saveLogFaixaUop }
    ];

    return filesInfo;
}

exports.lambdaHandler = async (event) => {
    console.log('data-saver');
    console.log('event : ', event);
    const { result: { bucketName, currentFolder, jsonFiles } } = event;
    const handlerInfos = getFilesHandler(currentFolder);
    for (const file of jsonFiles) {
        const { handler, key } = handlerInfos.find(f => f.key === file);
        const getParams = {
            Bucket: bucketName,
            Key: key
        };
        const { Body: buffer } = await s3.getObject(getParams).promise();
        const text = buffer.toString();
        const jsonArray = JSON.parse(text);
        await handler(jsonArray);
    }

};
