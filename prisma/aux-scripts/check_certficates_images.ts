import { PrismaClient } from '@prisma/client';
import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';

const prodUrl = 'postgresql://certifikedu:%23ArrozFrito978%23@127.0.0.1:9999/nest';
const BUCKET = 'serve-images-plataform-prod';

const prisma = new PrismaClient({ datasourceUrl: prodUrl });
const s3Client = new S3Client({ region: 'us-east-1' });

async function getCertPicturesPath() {
  const certificates = await prisma.certificates.findMany({
    select: { createdAt: true, certificatePicture: true, certificateId: true },
    orderBy: {createdAt: 'desc'},
  });

  console.log(certificates.length)

  return certificates;
}

async function checkS3file(key: string, certificateId: string): Promise<string> {
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch (error: any) {
    return certificateId;
  }
}

async function main() {
  const certs = await getCertPicturesPath();

  const missingPics: Record<string, string> = {};
  for (let cert of certs) {
    const certId = await checkS3file(cert.certificatePicture, cert.certificateId);

    await new Promise(r => setTimeout(r, 50));

    if (certId) {
      console.log(`Missing pic: ${certId}, ${cert.createdAt}`)
      missingPics[certId] = cert.certificatePicture;
    }
  }

  console.log(`total certificates missing pictures: ${Object.keys(missingPics).length}`)
  var fs = require('fs');
  fs.writeFile('missing.json', JSON.stringify(missingPics), function (err: any) {
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
