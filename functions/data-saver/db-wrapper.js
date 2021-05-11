const aws = require('aws-sdk');
const s3 = new aws.S3();
const knex = require('knex')({
    client: 'pg',
    version: '7.2',
    connection: {
        host: '9876:postgresql.goomer.ninja:5432',
        user: 'goomer',
        password: 'sougoomer',
        database: 'settings-resource'
    }
});

const openTransaction = async () => {
    return new Promise((resolve, reject) => {
        knex.transaction((error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

const saveBatchData = async (transaction, tableName, tableKeys, jsonArray) => {
    return new Promise((resolve, reject) => {
        try {
            transaction.insert(jsonArray, tableKeys)
                .into(tableName)
                .onConflict()
                .merge();
            resolve();
        } catch (error) {
            reject();
        }
    });
}

const getFilesHandler = (currentFolder) => {
    const filesInfo = [
        { source: `json/${currentFolder}/DELTA_LOG_FAIXA_UF.json`, tableName: 'DELTA_LOG_FAIXA_UF', tableKeys: ['UFE_SG', 'UFE_CEP_INI'] },
        { source: `json/${currentFolder}/DELTA_LOG_LOCALIDADE.json`, tableName: 'DELTA_LOG_LOCALIDADE', tableKeys: ['LOC_NU'] },
        { source: `json/${currentFolder}/DELTA_LOG_FAIXA_LOC.json`, tableName: 'DELTA_LOG_FAIXA_LOC', tableKeys: ['LOC_NU', 'LOC_CEP_INI'] },
        { source: `json/${currentFolder}/DELTA_LOG_BAIRRO.json`, tableName: 'DELTA_LOG_BAIRRO', tableKeys: ['BAI_NU'] },
        { source: `json/${currentFolder}/DELTA_LOG_FAIXA_BAIRRO.json`, tableName: 'DELTA_LOG_FAIXA_BAIRRO', tableKeys: ['BAI_NU', 'FCB_CEP_INI'] },
        { source: `json/${currentFolder}/DELTA_LOG_CPC.json`, tableName: 'DELTA_LOG_CPC', tableKeys: ['CPC_NU'] },
        { source: `json/${currentFolder}/DELTA_LOG_FAIXA_CPC.json`, tableName: 'DELTA_LOG_FAIXA_CPC', tableKeys: ['CPC_NU', 'CPC_INICIAL'] },
        { source: `json/${currentFolder}/DELTA_LOG_LOGRADOURO.json`, tableName: 'DELTA_LOG_LOGRADOURO', tableKeys: ['LOG_NU'] },
        { source: `json/${currentFolder}/DELTA_LOG_NUM_SEC.json`, tableName: 'DELTA_LOG_NUM_SEC', tableKeys: ['LOG_NU'] },
        { source: `json/${currentFolder}/DELTA_LOG_GRANDE_USUARIO.json`, tableName: 'DELTA_LOG_GRANDE_USUARIO', tableKeys: ['GRU_NU'] },
        { source: `json/${currentFolder}/DELTA_LOG_UNID_OPER.json`, tableName: 'DELTA_LOG_UNID_OPER', tableKeys: ['UOP_NU'] },
        { source: `json/${currentFolder}/DELTA_LOG_FAIXA_UOP.json`, tableName: 'DELTA_LOG_FAIXA_UOP', tableKeys: ['UOP_NU', 'FNC_INICIAL'] }
    ];

    return filesInfo;
}


const transactionalSaveBatchData = async (path, currentFolder, jsonFiles) => {
    const transaction = await openTransaction();
    try {
        const handlerInfos = getFilesHandler(currentFolder);
        for (const file of jsonFiles) {
            const { tableName, source, tableKeys } = handlerInfos.find(f => f.source === file);
            const buffer = await getFileFromS3(path, source);
            const text = buffer.toString();
            const jsonArray = JSON.parse(text);
            await saveBatchData(transaction, tableName, tableKeys, jsonArray);
        }
        transaction.commit();
    } catch (error) {
        transaction.rollback();
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

