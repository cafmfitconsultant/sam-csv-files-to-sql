const FileType = require('file-type');

class FileTooling {
    async validateZipFile(fileBuffer) {
        const result = await FileType.fromBuffer(fileBuffer);
        this._isZip(result);
    }
    _isZip(fileType) {
        const { ext } = fileType;
        if (ext !== 'zip') {
            throw new Error('Invalid zip file');
        }
    }

}

// Exports
module.exports = FileTooling;