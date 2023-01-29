import aws from "aws-sdk"
import config from "./index"

const s3 = new aws.S3({
    acessKeyId: config.S3_ACCESS_KEY,
    secretAccessKey: config.S3_SECRET_ACCESS_KEY,
    region: config.S3_REGION
})

export default s3