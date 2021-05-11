const aws = require('aws-sdk');
const s3 = new aws.S3();
const knex = require('knex')({
    client: 'pg',
    connection: {
        host: 'postgresql.goomer.ninja',
        user: 'goomer',
        port: 5432,
        password: 'sougoomer',
        database: 'settings-resource'
    }
});

const getFilesHandler = (currentFolder) => {
    const filesInfo = [
        { source: `json/${currentFolder}/DELTA_LOG_FAIXA_UF.json`, tableName: 'dne_log_faixa_uf', tableKeys: ['ufe_sg', 'ufe_cep_ini'], actionColumnKey: 'ufe_operacao' },
        { source: `json/${currentFolder}/DELTA_LOG_LOCALIDADE.json`, tableName: 'dne_log_localidade', tableKeys: ['loc_nu'], actionColumnKey: 'loc_operacao' },
        { source: `json/${currentFolder}/DELTA_LOG_FAIXA_LOC.json`, tableName: 'dne_log_faixa_localidade', tableKeys: ['loc_nu', 'loc_cep_ini', 'loc_tipo_faixa'], actionColumnKey: 'loc_faixa_operacao' },
        { source: `json/${currentFolder}/DELTA_LOG_BAIRRO.json`, tableName: 'dne_log_bairro', tableKeys: ['bai_nu'], actionColumnKey: 'bai_operacao' },
        { source: `json/${currentFolder}/DELTA_LOG_FAIXA_BAIRRO.json`, tableName: 'dne_log_faixa_bairro', tableKeys: ['bai_nu', 'fcb_cep_ini'], actionColumnKey: 'fcb_operacao' },
        { source: `json/${currentFolder}/DELTA_LOG_CPC.json`, tableName: 'dne_log_cpc', tableKeys: ['cpc_nu'], actionColumnKey: 'cpc_operacao' },
        { source: `json/${currentFolder}/DELTA_LOG_FAIXA_CPC.json`, tableName: 'dne_log_faixa_cpc', tableKeys: ['cpc_nu', 'cpc_inicial'], actionColumnKey: 'cpc_faixa_operacao' },
        { source: `json/${currentFolder}/DELTA_LOG_LOGRADOURO.json`, tableName: 'dne_log_logradouro', tableKeys: ['log_nu'], actionColumnKey: 'log_operacao' },
        { source: `json/${currentFolder}/DELTA_LOG_NUM_SEC.json`, tableName: 'dne_log_num_sec', tableKeys: ['log_nu'], actionColumnKey: 'sec_operacao' },
        { source: `json/${currentFolder}/DELTA_LOG_GRANDE_USUARIO.json`, tableName: 'dne_log_grande_usuario', tableKeys: ['gru_nu'], actionColumnKey: 'gru_operacao' },
        { source: `json/${currentFolder}/DELTA_LOG_UNID_OPER.json`, tableName: 'dne_log_unid_oper', tableKeys: ['uop_nu'], actionColumnKey: 'uop_operacao' },
        { source: `json/${currentFolder}/DELTA_LOG_FAIXA_UOP.json`, tableName: 'dne_log_faixa_uop', tableKeys: ['uop_nu', 'fnc_inicial'], actionColumnKey: 'fnc_operacao' }
    ];

    return filesInfo;
}

const upsertBatchData = async (transaction, tableName, tableKeys, upsertItems) => {
    try {
        const conflictKey = tableKeys;
        await transaction.insert(upsertItems, tableKeys)
            .into(tableName)
            .onConflict(conflictKey)
            .merge();
    } catch (error) {
        console.log('upsetBatchData error : ', error);
        throw error;
    }
}
const saveBatchData = async (transaction, jsonArray, handleInfo) => {
    const { tableName, tableKeys, actionColumnKey } = handleInfo;
    const upsertItems = jsonArray.filter((j) => j[actionColumnKey] === 'UPD' || j[actionColumnKey] === 'INS');
    if (upsertItems && upsertItems.length > 0) {
        await upsertBatchData(transaction, tableName, tableKeys, upsertItems);
    }
}

const transactionalSaveBatchData = async (path, currentFolder, sortedJsonFiles) => {
    const transaction = await knex.transaction();
    try {
        const handlerInfos = getFilesHandler(currentFolder);
        for (const file of sortedJsonFiles) {
            const handleInfo = handlerInfos.find(f => f.source === file);
            const { source } = handleInfo;
            const buffer = await getFileFromS3(path, source);
            const text = buffer.toString();
            const jsonArray = JSON.parse(text);
            await saveBatchData(transaction, jsonArray, handleInfo);
        }
        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }

};

const getFileFromS3 = async (folder, source) => {
    const getParams = {
        Bucket: folder,
        Key: source
    };
    const { Body: buffer } = await s3.getObject(getParams).promise();
    return buffer;
}


module.exports = { transactionalSaveBatchData };

