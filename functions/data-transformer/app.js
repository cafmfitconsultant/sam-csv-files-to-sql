const aws = require('aws-sdk');
const s3 = new aws.S3();

const deltaLogFaixaUFParserParameters = {
    delimiter: "@",
    headers: ["ufe_sg", "ufe_cep_ini", "ufe_cep_fim", "ufe_operacao"],
    checkColumn: true,
    checkType: true,
    ignoreEmpty: true

};
const deltaLoglocalidadeParserParameters = {
    delimiter: "@",
    headers: ["loc_nu", "ufe_sg", "loc_no", "cep", "loc_in_sit",
        "loc_in_tipo_loc", "loc_nu_sub", "loc_no_abrev", "mun_nu", "loc_operacao",
        "cep_ant"],
    checkColumn: true,
    checkType: true,
    ignoreEmpty: true
};
const deltaLogFaixaLocParserParameters = {
    delimiter: "@",
    headers: ["loc_nu", "loc_cep_ini", "loc_cep_fim", "loc_faixa_operacao", "loc_tipo_faixa"],
    checkColumn: true,
    checkType: true,
    ignoreEmpty: true
};
const deltaLogBairroParserParameters = {
    delimiter: "@",
    headers: ["bai_nu", "ufe_sg", "loc_nu", "bai_no", "bai_no_abrev", "bai_operacao"],
    checkColumn: true,
    checkType: true,
    ignoreEmpty: true
};
const deltaLogFaixaBairroParserParameters = {
    delimiter: "@",
    headers: ["bai_nu", "fcb_cep_ini", "fcb_cep_fim", "fcb_operacao"],
    checkColumn: true,
    checkType: true,
    ignoreEmpty: true
};
const deltaLogCpcParserParameters = {
    delimiter: "@",
    headers: ["cpc_nu", "ufe_sg", "loc_nu", "cpc_no", "cpc_endereco", "cep", "cpc_operacao", "cep_ant"],
    checkColumn: true,
    checkType: true,
    ignoreEmpty: true
};
const deltaLogFaixaCpcParserParameters = {
    delimiter: "@",
    headers: ["cpc_nu", "cpc_inicial", "cpc_final", "cpc_faixa_operacao"],
    checkColumn: true,
    checkType: true,
    ignoreEmpty: true
};
const deltaLogLogradouroParserParameters = {
    delimiter: "@",
    headers: ["log_nu", "ufe_sg", "loc_nu", "bai_nu_ini", "bai_nu_fim", "log_no", "log_complemento", "cep", "tlo_tx", "log_sta_tlo", "log_no_abrev", "log_operacao", "cep_ant"],
    checkColumn: true,
    ignoreEmpty: true
};
const deltaLogNumSecParserParameters = {
    delimiter: "@",
    headers: ["log_nu", "sec_nu_ini", "sec_nu_fim", "sec_in_lado", "sec_operacao"],
    checkColumn: true,
    checkType: true,
    ignoreEmpty: true
};
const deltaLogGrandeUsuarioParserParameters = {
    delimiter: "@",
    headers: ["gru_nu", "ufe_sg", "loc_nu", "bai_nu", "log_nu", "gru_no", "gru_endereco", "cep", "gru_no_abrev", "gru_operacao", "cep_ant"],
    checkColumn: true,
    checkType: true,
    ignoreEmpty: true
};
const deltaLogUnidOperParserParameters = {
    delimiter: "@",
    headers: ["uop_nu", "ufe_sg", "loc_nu", "bai_nu", "log_nu", "uop_no", "uop_endereco", "cep", "uop_in_cp", "uop_no_abrev", "uop_operacao", "cep_ant"],
    checkColumn: true,
    checkType: true,
    ignoreEmpty: true
};
const deltaLogFaixoUopParserParameters = {
    delimiter: "@",
    headers: ["uop_nu", "fnc_inicial", "fnc_final", "fnc_operacao"],
    checkColumn: true,
    checkType: true,
    ignoreEmpty: true
};

const getFilesPathInfo = (currentFolder) => {
    const filesParseInfo = [
        { origin: `raw/${currentFolder}/DELTA_LOG_FAIXA_UF.csv`, destination: `json/${currentFolder}/DELTA_LOG_FAIXA_UF.json`, parseInfo: deltaLogFaixaUFParserParameters, position: 1 },
        { origin: `raw/${currentFolder}/DELTA_LOG_LOCALIDADE.csv`, destination: `json/${currentFolder}/DELTA_LOG_LOCALIDADE.json`, parseInfo: deltaLoglocalidadeParserParameters, position: 2 },
        { origin: `raw/${currentFolder}/DELTA_LOG_FAIXA_LOC.csv`, destination: `json/${currentFolder}/DELTA_LOG_FAIXA_LOC.json`, parseInfo: deltaLogFaixaLocParserParameters, position: 3 },
        { origin: `raw/${currentFolder}/DELTA_LOG_BAIRRO.csv`, destination: `json/${currentFolder}/DELTA_LOG_BAIRRO.json`, parseInfo: deltaLogBairroParserParameters, position: 4 },
        { origin: `raw/${currentFolder}/DELTA_LOG_FAIXA_BAI.csv`, destination: `json/${currentFolder}/DELTA_LOG_FAIXA_BAIRRO.json`, parseInfo: deltaLogFaixaBairroParserParameters, position: 5 },
        { origin: `raw/${currentFolder}/DELTA_LOG_CPC.csv`, destination: `json/${currentFolder}/DELTA_LOG_CPC.json`, parseInfo: deltaLogCpcParserParameters, position: 6 },
        { origin: `raw/${currentFolder}/DELTA_LOG_FAIXA_CPC.csv`, destination: `json/${currentFolder}/DELTA_LOG_FAIXA_CPC.json`, parseInfo: deltaLogFaixaCpcParserParameters, position: 7 },
        { origin: `raw/${currentFolder}/DELTA_LOG_LOGRADOURO.csv`, destination: `json/${currentFolder}/DELTA_LOG_LOGRADOURO.json`, parseInfo: deltaLogLogradouroParserParameters, position: 8 },
        { origin: `raw/${currentFolder}/DELTA_LOG_NUM_SEC.csv`, destination: `json/${currentFolder}/DELTA_LOG_NUM_SEC.json`, parseInfo: deltaLogNumSecParserParameters, position: 9 },
        { origin: `raw/${currentFolder}/DELTA_LOG_GRANDE_USUARIO.csv`, destination: `json/${currentFolder}/DELTA_LOG_GRANDE_USUARIO.json`, parseInfo: deltaLogGrandeUsuarioParserParameters, position: 10 },
        { origin: `raw/${currentFolder}/DELTA_LOG_UNID_OPER.csv`, destination: `json/${currentFolder}/DELTA_LOG_UNID_OPER.json`, parseInfo: deltaLogUnidOperParserParameters, position: 11 },
        { origin: `raw/${currentFolder}/DELTA_LOG_FAIXA_UOP.csv`, destination: `json/${currentFolder}/DELTA_LOG_FAIXA_UOP.json`, parseInfo: deltaLogFaixoUopParserParameters, position: 12 }
    ];

    return filesParseInfo;
}

const csv = require('csvtojson');
exports.lambdaHandler = async (event) => {
    const { result: { bucketName, currentFolder, files } } = event;
    const infos = getFilesPathInfo(currentFolder);
    const jsonFiles = [];
    for (const file of files) {
        const getParams = {
            Bucket: bucketName,
            Key: file
        };
        const { Body: buffer } = await s3.getObject(getParams).promise();
        const info = infos.find(f => f.origin === file);
        const csvStr = buffer.toString();
        const converter = csv(info.parseInfo);
        const jsonArray = await converter.fromString(csvStr);
        const key = { destination: info.destination, position: info.position };
        const putParams = {
            Bucket: bucketName,
            Key: key.destination,
            Body: JSON.stringify(jsonArray),
            ContentType: 'application/json'
        }
        await s3.putObject(putParams).promise();
        jsonFiles.push(key);
    }
    const sortedJsonFiles = jsonFiles.sort((a, b) => {
        if (a.position > b.position) {
            return 1;
        }
        if (a.position < b.position) {
            return -1
        }
        return 0;
    }).map((i) => i.destination);
    const nextStepInfo = {
        currentFolder,
        bucketName,
        sortedJsonFiles
    };

    return nextStepInfo;
};
