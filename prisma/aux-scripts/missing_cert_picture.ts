import { Prisma, PrismaClient } from '@prisma/client';
import { IIssueSelfCertificateLambda, ISignCertificateLambda } from 'src/requests/requests.interfaces';
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AssumeRoleCommand, STSClient } from '@aws-sdk/client-sts';
import { ICredentialsSTS } from 'src/aws/sts/interfaces/sts.interfaces';
import * as aws4 from 'aws4';

const prodUrl = 'postgresql://certifikedu:%23ArrozFrito978%23@127.0.0.1:9999/nest';
const BUCKET = 'serve-images-plataform-prod';
const BUCKET_NEST = 'certifikedu-nest-files';
const PUBLIC_TEMPLATE = 'Certificado_Compartilhamento.png';

const prisma = new PrismaClient({ datasourceUrl: prodUrl });

export const certificateQuery = Prisma.validator<Prisma.CertificatesSelect>()({
  certificateId: true,
  createdAt: true,
  name: true,
  receptorName: true,
  emissorName: true,
  emissorId: true,
  descriptionImage: true,
  cargaHoraria: true,
  issuedAt: true,
  template: {
    select: {
      templateId: true,
      createdAt: true,
      issuedAt: true,
      cargaHoraria: true,
      name: true,
      qrCodePosition: true,
      logoImage: true,
      descriptionImage: true,
      backgroundImage: true,
      certificatePicture: true,
      hexFontColor: true,
    },
  },
});

type TMissing = Prisma.CertificatesGetPayload<{
  select: typeof certificateQuery;
}>;

async function getMissingInfo(certificatesIds: Array<string>): Promise<Array<TMissing>> {
  return await prisma.certificates.findMany({
    where: { certificateId: { in: certificatesIds } },
    select: certificateQuery,
  });
}

function formatDateString(date: Date): string {
  try {
    const today = date;
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const year = today.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (err) {
    return null;
  }
}

function getCertificatePicturePath(userId: string, certificateId: string, fileType: string): string {
  return `users/${userId}/certificates/${certificateId}/certificate_image.${fileType}`;
}

const stsClient = new STSClient({ region: 'us-east-1' });
async function getSignedCredentials(): Promise<ICredentialsSTS> {
  const command = new AssumeRoleCommand({
    ExternalId: 'node-tester',
    RoleArn: 'arn:aws:iam::331948931399:role/AdminRole',
    RoleSessionName: 'execute-api-test',
  });

  const roleResponse = await stsClient.send(command);

  const credentials = {
    secretAccessKey: roleResponse.Credentials!.SecretAccessKey!,
    accessKeyId: roleResponse.Credentials!.AccessKeyId!,
    sessionToken: roleResponse.Credentials!.SessionToken!,
  };

  return credentials;
}

const axiosClient: AxiosInstance = axios;
axiosClient.defaults.baseURL = `https://lambda.certifikedu.com`;
axiosClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const url = new URL(config.url!, config.baseURL);
  const requestPayload = {
    host: url.hostname,
    path: url.pathname,
    method: config.method?.toUpperCase() ?? 'POST',
    body: config.data ? JSON.stringify(config.data) : undefined,
    headers: { 'Content-Type': 'application/json' },
    service: 'execute-api',
    region: 'us-east-1',
  };

  const credentials = await getSignedCredentials();

  aws4.sign(requestPayload, credentials);

  config.headers['X-Amz-Security-Token'] = requestPayload.headers['X-Amz-Security-Token'];
  config.headers['X-Amz-Date'] = requestPayload.headers['X-Amz-Date'];
  config.headers['Content-Length'] = requestPayload.headers['Content-Length'];
  config.headers['Authorization'] = requestPayload.headers['Authorization'];
  config.headers['Host'] = requestPayload.headers['Host'];

  return config;
});

axiosClient.interceptors.response.use((response: AxiosResponse) => {
  return response;
});

async function sendRequestOverlap(data: ISignCertificateLambda | IIssueSelfCertificateLambda) {
  await axiosClient.post('/OverlapImages', data);
}

async function main() {
  var fs = require('fs');
  const fileData = fs.readFileSync('missing.json', 'utf-8');
  const data = JSON.parse(fileData) as Record<string, string>;

  console.log(`missing jason: ${Object.keys(data).length}`)

  const missing = await getMissingInfo(Object.keys(data));

  console.log(`got missing info ${missing.length}`)

  const errors: Record<string, string> = {};
  const fromTemplateMissingPic: Record<string, string> = {};
  const p = missing.map(async (c) => {
    if (c.template?.templateId) {
      if (c.template?.certificatePicture) {
        const lambdaData: ISignCertificateLambda = {
          template_bucket: BUCKET,
          template_path: c.template.certificatePicture,
          destination_bucket: BUCKET,
          destination_path: getCertificatePicturePath(c.emissorId, c.certificateId, 'png'),
          picture_type: 'sign',
          hash: c.template.templateId,
          receptor_name: c.receptorName,
          qrcode_position: c.template.qrCodePosition ?? null,
          font_color: c.template.hexFontColor ?? null,
        };

        try {
          await sendRequestOverlap(lambdaData);
          console.log(`Success ${c.certificateId}`);
        } catch (err) {
          console.log(`error calling lambda: ${err}`);
          errors[c.certificateId] = err;
        }
      } else {
        fromTemplateMissingPic[c.certificateId] = c.template.templateId;
        console.log(`certificate from template but missing template picture path: ${c.certificateId}`);
      }
    } else {
      const lambdaData: IIssueSelfCertificateLambda = {
        template_bucket: BUCKET_NEST,
        template_path: PUBLIC_TEMPLATE,
        destination_bucket: BUCKET,
        destination_path: getCertificatePicturePath(c.emissorId, c.certificateId, 'png'),
        picture_type: 'certificate',
        receptor_name: c.receptorName,
        certificate_name: c.name,
        hash: c.certificateId,
        qrcode_position: 'NULL',
        hours: (c.cargaHoraria / 60).toString(),
        issued_at: formatDateString(c.issuedAt ?? c.createdAt),
        issuer: c.emissorName,
      };

        try {
          await sendRequestOverlap(lambdaData);
          console.log(`Success ${c.certificateId}`);
        } catch (err) {
          console.log(`error calling lambda: ${err}`);
          errors[c.certificateId] = err;
        }
    }
  });
  await Promise.all(p);

  console.log(`Errors: ${Object.keys(errors).length}`);
  fs.writeFile('errors_from_missing.json', JSON.stringify(errors), function (err: any) {
    if (err) {
      console.log(err);
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
