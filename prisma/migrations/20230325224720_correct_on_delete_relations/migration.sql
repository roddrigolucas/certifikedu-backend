-- DropForeignKey
ALTER TABLE "CertificatesSharing" DROP CONSTRAINT "CertificatesSharing_certificateId_fkey";

-- DropForeignKey
ALTER TABLE "certificates" DROP CONSTRAINT "certificates_emissorId_emissorDoc_emissorEmail_fkey";

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_emissorId_emissorDoc_emissorEmail_fkey" FOREIGN KEY ("emissorId", "emissorDoc", "emissorEmail") REFERENCES "users"("id", "numeroDocumento", "email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificatesSharing" ADD CONSTRAINT "CertificatesSharing_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "certificates"("certificateId") ON DELETE CASCADE ON UPDATE CASCADE;
