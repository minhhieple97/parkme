import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { S3Client, S3ClientConfig } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

@Injectable()
export class AwsService {
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    this.s3Client = new S3Client(this.getAwsConfig());
  }

  private getAwsConfig(): S3ClientConfig {
    return {
      region: this.configService.get<string>("AWS_REGION"),
      credentials: {
        accessKeyId: this.configService.get<string>("AWS_ACCESS_KEY_ID"),
        secretAccessKey: this.configService.get<string>(
          "AWS_SECRET_ACCESS_KEY"
        ),
      },
    };
  }

  async uploadFile(
    buffer: Buffer,
    key: string,
    contentType: string
  ): Promise<string> {
    const uploadParams = {
      Bucket: this.configService.get<string>("AWS_S3_BUCKET_NAME"),
      Key: key,
      Body: buffer,
      ContentType: contentType,
    };

    const upload = new Upload({
      client: this.s3Client,
      params: uploadParams,
    });

    const uploadResult = await upload.done();
    return `https://${uploadResult.Bucket}.s3.${this.configService.get<string>(
      "AWS_REGION"
    )}.amazonaws.com/${uploadResult.Key}`;
  }
}
