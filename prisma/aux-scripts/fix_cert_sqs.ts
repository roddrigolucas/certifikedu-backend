import { PrismaClient } from '@prisma/client';
import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { ICreateOpenBadge } from 'src/openbadge/interfaces/openbadge.interfaces';
import { IBakeOpenBadge } from 'src/requests/requests.interfaces';
import { createHash, randomUUID } from 'crypto';
import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { ICertificateLedger } from 'src/blockchain/interfaces/blockchain.interfaces';
import { QldbDriver, TransactionExecutor } from 'amazon-qldb-driver-nodejs';

const prodUrl = 'postgresql://certifikedu:%23ArrozFrito978%23@127.0.0.1:9999/nest';
const prisma = new PrismaClient({ datasourceUrl: prodUrl });

const BUCKET = 'serve-images-plataform-prod';

async function getCertPicturesPath() {
  const certificates = await prisma.certificates.findMany({
    where: { createdAt: { gte: new Date(2024, 8, 15) }, templateId: { not: null } },
    select: { certificatePicture: true, templateId: true, certificateId: true },
  });

  return certificates;
}

const s3Client = new S3Client({ region: 'us-east-1' });

async function checkS3file(key: string, certificateId: string) {
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return null;
  } catch (error: any) {
    console.log(key);
    return certificateId;
  }
}

// const sqs = new SQSClient({ region: 'us-east-1' });

async function sendSqsEvent(certificateId: string) {
  const cloudfrontBucket = BUCKET;

  function getOpenBadgePicturePath(userId: string, certificateId: string, fileType: string, version = 1): string {
    return `users/${userId}/certificates/${certificateId}/open_badge/v${version}/certificate_open_badge.${fileType}`;
  }

  const certificate = await prisma.certificates.findUnique({
    where: { certificateId: certificateId },
    include: { hashes: true },
  });

  const recipient = await prisma.user.findUnique({
    where: { numeroDocumento: certificate.receptorDoc },
  });

  const templateInfo = await prisma.templates.findUnique({
    where: { templateId: certificate.templateId },
    include: { school: true },
  });

  const certificateOpenBadge = {
    certificateId: certificate.certificateId,
    recipientEmail: recipient.email,
    expires: certificate?.expiresAt?.toISOString() ?? null,
    issuedOn: certificate?.issuedAt?.toISOString() ?? certificate.createdAt.toISOString(),
    certificateName: certificate.name,
    certificateDescription: certificate.description,
    certificateImage: certificate.certificatePicture,
    schoolName: templateInfo.school?.name ?? 'CertifikEdu Certificados',
    schoolUrl: templateInfo.school?.homepageUrl ?? 'https://www.certifikedu.com',
    schoolEmail: templateInfo.school?.email ?? 'certifikedu@certifikedu.com',
    openBadgeVersion: 1,
    destination_bucket: cloudfrontBucket,
    destination_path: getOpenBadgePicturePath(certificate.emissorId, certificate.certificateId, 'png'),
  };

  const imageInfo = {
    picture_type: 'sign',
    template_bucket: cloudfrontBucket,
    template_path: templateInfo.certificatePicture,
    destination_bucket: cloudfrontBucket,
    destination_path: certificate.certificatePicture,
    receptor_name: certificate.receptorName,
    hash: certificate.hashes.at(0).certificateHash,
    qrcode_position: templateInfo.qrCodePosition,
    font_color: templateInfo.hexFontColor ?? '#000000',
  };

  const eventData = {
    Sign: imageInfo,
    OpenBadge: await createOpenBadgeClassJson(certificate.emissorId, certificateOpenBadge),
  };

  const sendEvent: SendMessageCommand = new SendMessageCommand({
    QueueUrl: 'https://sqs.us-east-1.amazonaws.com/331948931399/issue-certificate-queue.fifo',
    MessageBody: JSON.stringify(eventData),
    MessageGroupId: randomUUID(),
  });

  // await sqs.send(sendEvent);
}

async function createOpenBadgeClassJson(userId: string, certificateData: ICreateOpenBadge): Promise<IBakeOpenBadge> {
  function getHashedIdentity(email: string): string {
    return `sha256$${createHash('sha256').update(email).digest('hex')}`;
  }

  function getOpenBadgeJsonPath(userId: string, certificateId: string, type: string, version = 1): string {
    return `users/${userId}/certificates/${certificateId}/open_badge/v${version}/${type}.json`;
  }

  const certifikeduImages = 'https://images.certifikedu.com';

  return {
    s3_image_path: `${BUCKET}/${certificateData.certificateImage}`,
    badge_class: [
      {
        '@context': 'https://w3id.org/openbadges/v2',
        type: 'Assertion',
        id: `${certifikeduImages}/${getOpenBadgeJsonPath(
          userId,
          certificateData.certificateId,
          'assertion',
          certificateData.openBadgeVersion,
        )}`,
        recipient: {
          type: 'email',
          hashed: true,
          identity: getHashedIdentity(certificateData.recipientEmail),
        },
        issuedOn: certificateData.issuedOn,
        verification: {
          type: 'hosted',
        },
        badge: {
          '@context': 'https://w3id.org/openbadges/v2',
          type: 'BadgeClass',
          id: `${certifikeduImages}/${getOpenBadgeJsonPath(
            userId,
            certificateData.certificateId,
            'badge_class',
            certificateData.openBadgeVersion,
          )}`,
          name: certificateData.certificateName,
          description: certificateData.certificateDescription,
          image: `${certifikeduImages}/${certificateData.certificateImage}`,
          criteria: {
            narrative: 'Certifikedu Certificate',
          },
        },
        issuer: {
          '@context': 'https://w3id.org/openbadges/v2',
          type: 'Issuer',
          id: `${certifikeduImages}/${getOpenBadgeJsonPath(
            userId,
            certificateData.certificateId,
            'issuer',
            certificateData.openBadgeVersion,
          )}`,
          name: certificateData.schoolName,
          url: certificateData.schoolUrl,
          email: certificateData.schoolEmail,
          verification: {
            startsWith: certifikeduImages,
          },
        },
      },
    ],
    destination_path: certificateData.destination_path,
    destination_bucket: BUCKET,
  };
}

async function findFailedBlockchain() {
  const certificates = await prisma.certificates.findMany({
    where: {
      blockchain: false,
      templateId: { not: null },
      createdAt: { gte: new Date(2024, 9, 1) },
    },
    select: { certificateId: true },
  });

  return certificates.map((c) => c.certificateId);
}

async function findFailedOpenBadge() {
  const certificates = await prisma.certificates.findMany({
    where: { 
      openBadge: false, 
      templateId: { not: null }, 
      createdAt: { gte: new Date(2024, 9, 1) },
    },
    select: { certificateId: true },
  });

  return certificates.map((c) => c.certificateId);
}

const qldbDriver = new QldbDriver('certifikedu-ledger', { region: 'us-east-1' });

async function fixBlockchain(certId: string) {
  const certificate = await prisma.certificates.findUnique({
    where: { certificateId: certId },
    include: { habilidades: { include: { habilidade: true } } },
  });

  const info = {
    createdAt: new Date(),
    userId: certificate.emissorId,
    certificateId: certificate.certificateId,
    certificateCreationDate: certificate.createdAt,
    receptorDoc: certificate.receptorDoc,
    receptorName: certificate.receptorName ? certificate.receptorName : '',
    certificateName: certificate.name,
    certificateDescription: certificate.description,
    certificateHoursWorkload: certificate.cargaHoraria,
    associatedAbilities: certificate.habilidades.map((a) => a.habilidade.habilidade),
    emissorName: certificate.emissorName,
    emissorDoc: certificate.emissorDoc,
  };

  async function insertCertificateOnLedger(certificateData: ICertificateLedger): Promise<string> {
    const documentId: string = await qldbDriver.executeLambda(async (txn: TransactionExecutor) => {
      const transResult = await txn.execute('INSERT INTO certificates ?', certificateData);

      const jsonString = JSON.stringify(transResult);
      const writeResult = JSON.parse(jsonString);

      return writeResult._resultList[0].documentId;
    });

    return documentId;
  }

  const docId = await insertCertificateOnLedger(info);

  await prisma.certificates.update({
    where: {certificateId: certificate.certificateId},
    data: {blockchain: true, blockchainUrl: docId}
  });
}

async function main() {
  const certs = await getCertPicturesPath();

  console.log(certs.length);

  const missingPics: Array<string> = [];
  const p = certs.map(async (cert) => {
    const certId = await checkS3file(cert.certificatePicture, cert.certificateId);

    if (certId) {
      missingPics.push(certId);
    }
  });

  await Promise.all(p);

  console.log(missingPics.length);

  const failedBlockchain = await findFailedBlockchain();

  const failedOpenBadge = await findFailedOpenBadge();
  const certIds = missingPics.concat(failedBlockchain).concat(failedOpenBadge);
  console.log(certIds.length);

  const errors = [];
  let err = 0;
  let berr = 0;
  let suc = 0;
  const m = certIds.map(async (certId) => {
    try {
      await sendSqsEvent(certId);
      suc++;
    } catch (error) {
      errors.push(certId);
      err++;

      if (err <= 10) {
        console.log(error);
      }
    }

    try {
      if (failedBlockchain.includes(certId)) {
        await fixBlockchain(certId);
      }
    } catch (err) {
      berr++;
      if (berr < 10) {
        console.log(err);
      }
    }
  });

  await Promise.all(m);

  console.log('blockchain', failedBlockchain.length);
  console.log('qldb', failedOpenBadge.length);
  console.log(
    `Errors: ${err}, QLDBError: ${berr}, Success: ${suc}, Total: ${certIds.length}, Missing: ${missingPics.length}`,
  );
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
