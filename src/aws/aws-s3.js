const aws = require('aws-sdk')

aws.config.update({
    accessKeyId: 'AKIAY3L35MCRZNIRGT6N',
    secretAccessKey: '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',
    region: 'ap-south-1'
});

const uploadFile = async (file) => {
    return new Promise((resolve, reject) => {
        let s3 = new aws.S3({ apiVersion: '2006-03-01' });
        var uploadParams = {
            ACL: 'public-read',
            Bucket: 'classroom-training-bucket',
            Key: 'group1project/' + file.originalname,
            Body: file.buffer
        }
        s3.upload(uploadParams, (err, data) => {
            if (err) {
                return reject({ 'error': err });
            }
            console.log(` '${file.originalname}' uploaded successfully.`);
            return resolve(data.Location);
        })

    })
};

module.exports = { uploadFile };