const aws = require('aws-sdk');
const s3 = new aws.S3();

const deltaLogFaixaUFParserParameters = {
    delimiter: "@",
    headers: ["ufe_sg", "ufe_cep_ini", "ufe_cep_fim", "ufe_operacao"],
    checkColumn: true,
};
const deltaLoglocalidadeParserParameters = {
    delimiter: "@",
    headers: ["loc_nu", "ufe_sg", "loc_no", "cep", "loc_in_sit",
        "loc_in_tipo_loc", "loc_nu_sub", "loc_no_abrev", "mun_nu", "loc_operacao",
        "cep_ant"],
    checkColumn: true,
};
const deltaLogFaixaLocParserParameters = {
    delimiter: "@",
    headers: ["loc_nu", "loc_cep_ini", "loc_cep_fim", "loc_faixa_operacao", "loc_tipo_faixa"],
    checkColumn: true,
};
const deltaLogBairroParserParameters = {
    delimiter: "@",
    headers: ["bai_nu", "ufe_sg", "loc_nu", "bai_no", "bai_no_abrev", "bai_operacao"],
    checkColumn: true,
};
const deltaLogFaixaBairroParserParameters = {
    delimiter: "@",
    headers: ["bai_nu", "fcb_cep_ini", "fcb_cep_fim", "fcb_operacao", "bai_no_abrev", "bai_operacao"],
    checkColumn: true,
};
const deltaLogCpcParserParameters = {
    delimiter: "@",
    headers: ["cpc_nu", "ufe_sg", "loc_nu", "cpc_no", "cpc_endereco", "cep", "cpc_operacao", "cep_ant"],
    checkColumn: true,
};
const deltaLogFaixaCpcParserParameters = {
    delimiter: "@",
    headers: ["cpc_nu", "cpc_inicial", "cpc_final", "cpc_faixa_operacao"],
    checkColumn: true,
};
const deltaLogLogradouroParserParameters = {
    delimiter: "@",
    headers: ["log_nu", "ufe_sg", "loc_nu", "bai_nu_ini", "bai_nu_fim", "log_no", "log_complemento", "cep", "tlo_tx", "log_sta_tlo", "log_no_abrev", "log_operacao", "cep_ant"],
    checkColumn: true,
};
const deltaLogNumSecParserParameters = {
    delimiter: "@",
    headers: ["log_nu", "sec_nu_ini", "sec_nu_fim", "sec_in_lado", "sec_operacao"],
    checkColumn: true,
};
const deltaLogGrandeUsuarioParserParameters = {
    delimiter: "@",
    headers: ["gru_nu", "ufe_sg", "loc_nu", "bai_nu", "log_nu", "gru_no", "gru_endereco", "cep", "gru_no_abrev", "gru_operacao", "cep_ant"],
    checkColumn: true,
};
const deltaLogUnidOperParserParameters = {
    delimiter: "@",
    headers: ["uop_nu", "ufe_sg", "loc_nu", "bai_nu", "log_nu", "uop_no", "uop_endereco", "cep", "uop_in_cp", "uop_no_abrev", "uop_operacao", "cep_ant"],
    checkColumn: true,
};
const deltaLogFaixoUopParserParameters = {
    delimiter: "@",
    headers: ["uop_nu", "fnc_inicial", "fnc_final", "fnc_operacao"],
    checkColumn: true,
};

const getFilesPathInfo = (currentFolder) => {
    const filesParseInfo = [
        { key: "1", origin: `raw/${currentFolder}/DELTA_LOG_FAIXA_UF.csv`, destination: `json/${currentFolder}/DELTA_LOG_FAIXA_UF.json`, parseInfo: deltaLogFaixaUFParserParameters },
        { origin: `raw/${currentFolder}/DELTA_LOG_LOCALIDADE.csv`, destination: `json/${currentFolder}/DELTA_LOG_LOCALIDADE.json`, parseInfo: deltaLoglocalidadeParserParameters },
        { origin: `raw/${currentFolder}/DELTA_LOG_FAIXA_LOC.csv`, destination: `json/${currentFolder}/DELTA_LOG_FAIXA_LOC.json`, parseInfo: deltaLogFaixaLocParserParameters },
        { origin: `raw/${currentFolder}/DELTA_LOG_BAIRRO.csv`, destination: `json/${currentFolder}/DELTA_LOG_BAIRRO.json`, parseInfo: deltaLogBairroParserParameters },
        { origin: `raw/${currentFolder}/DELTA_LOG_FAIXA_BAIRRO.csv`, destination: `json/${currentFolder}/DELTA_LOG_FAIXA_BAIRRO.json`, parseInfo: deltaLogFaixaBairroParserParameters },
        { origin: `raw/${currentFolder}/DELTA_LOG_CPC.csv`, destination: `json/${currentFolder}/DELTA_LOG_CPC.json`, parseInfo: deltaLogCpcParserParameters },
        { origin: `raw/${currentFolder}/DELTA_LOG_FAIXA_CPC.csv`, destination: `json/${currentFolder}/DELTA_LOG_FAIXA_CPC.json`, parseInfo: deltaLogFaixaCpcParserParameters },
        { origin: `raw/${currentFolder}/DELTA_LOG_LOGRADOURO.csv`, destination: `json/${currentFolder}/DELTA_LOG_LOGRADOURO.json`, parseInfo: deltaLogLogradouroParserParameters },
        { origin: `raw/${currentFolder}/DELTA_LOG_NUM_SEC.csv`, destination: `json/${currentFolder}/DELTA_LOG_NUM_SEC.json`, parseInfo: deltaLogNumSecParserParameters },
        { origin: `raw/${currentFolder}/DELTA_LOG_GRANDE_USUARIO.csv`, destination: `json/${currentFolder}/DELTA_LOG_GRANDE_USUARIO.json`, parseInfo: deltaLogGrandeUsuarioParserParameters },
        { origin: `raw/${currentFolder}/DELTA_LOG_UNID_OPER.csv`, destination: `json/${currentFolder}/DELTA_LOG_UNID_OPER.json`, parseInfo: deltaLogUnidOperParserParameters },
        { origin: `raw/${currentFolder}/DELTA_LOG_FAIXA_UOP.csv`, destination: `json/${currentFolder}/DELTA_LOG_FAIXA_UOP.json`, parseInfo: deltaLogFaixoUopParserParameters }
    ];

    return filesParseInfo;
}

const csv = require('csvtojson');
exports.lambdaHandler = async (event) => {
    const { result: { bucketName, currentFolder, files } } = event;
    const infos = getFilesPathInfo(currentFolder);
    try {
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
            const key = info.destination;
            const putParams = {
                Bucket: bucketName,
                Key: key,
                Body: JSON.stringify(jsonArray),
                ContentType: 'application/json'
            }
            await s3.putObject(putParams).promise();
            jsonFiles.push(key);
        }
        const nextStepInfo = {
            currentFolder,
            bucketName,
            jsonFiles
        };

        return nextStepInfo;

    } catch (error) {
        console.log(error);
    }
};
