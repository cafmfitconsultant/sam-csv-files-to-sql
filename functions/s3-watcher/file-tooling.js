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

    async getFileBufferFromS3(bucket, key){
        const buffer = await s3.getObject({ Bucket: bucket, Key: key }).promise();
        return buffer;
    }

    async unzip(fileBuffer) {
        fileBuffer.createReadStream()
        .on("error", (e) => console.log(`Error extracting file: `, e))
        .pipe(
          unzipper.ParseOne("file_name_inside_zip.ext", {
            forceStream: true,
          })
        );
  
      /**
       * Step 2: upload extracted stream back to S3: this method supports a readable stream in the Body param as per
       *  https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property
       */
      await s3
        .upload({ Bucket: bucket, Key: target_filename, Body: file_stream })
        .promise();  
    }

}

// Exports
module.exports = FileTooling;