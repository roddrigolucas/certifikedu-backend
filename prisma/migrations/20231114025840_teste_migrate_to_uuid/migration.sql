/*
  Warnings:

  - The primary key for the `AbilityOnCertificate` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `DocumentsPictures` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PessoaFisica` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PessoaJuridica` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `certificates` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "AbilityOnCertificate" DROP CONSTRAINT "AbilityOnCertificate_certificateId_fkey";

-- DropForeignKey
ALTER TABLE "AbilityOnCertificate" DROP CONSTRAINT "AbilityOnCertificate_habilidadeId_fkey";

-- DropForeignKey
ALTER TABLE "AbilityOnCertificate" DROP CONSTRAINT "AbilityOnCertificate_userId_fkey";

-- DropForeignKey
ALTER TABLE "ApiKeys" DROP CONSTRAINT "ApiKeys_userId_fkey";

-- DropForeignKey
ALTER TABLE "BlockchainCredits" DROP CONSTRAINT "BlockchainCredits_userId_paymentId_paymentDate_fkey";

-- DropForeignKey
ALTER TABLE "BlockchainTransactions" DROP CONSTRAINT "BlockchainTransactions_blockchainCreditId_fkey";

-- DropForeignKey
ALTER TABLE "BlockchainTransactions" DROP CONSTRAINT "BlockchainTransactions_certificateId_fkey";

-- DropForeignKey
ALTER TABLE "BlockchainTransactions" DROP CONSTRAINT "BlockchainTransactions_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "BlockchainTransactions" DROP CONSTRAINT "BlockchainTransactions_userId_fkey";

-- DropForeignKey
ALTER TABLE "CertificatesCredits" DROP CONSTRAINT "CertificatesCredits_userId_paymentId_paymentDate_fkey";

-- DropForeignKey
ALTER TABLE "CertificatesSharing" DROP CONSTRAINT "CertificatesSharing_certificateId_fkey";

-- DropForeignKey
ALTER TABLE "DocumentsPictures" DROP CONSTRAINT "DocumentsPictures_userId_fkey";

-- DropForeignKey
ALTER TABLE "EvidenceOpenBadge" DROP CONSTRAINT "EvidenceOpenBadge_certificateId_fkey";

-- DropForeignKey
ALTER TABLE "NarrativeOpenBadge" DROP CONSTRAINT "NarrativeOpenBadge_certificateId_fkey";

-- DropForeignKey
ALTER TABLE "PagarmeCustomers" DROP CONSTRAINT "PagarmeCustomers_userId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentTransaction" DROP CONSTRAINT "PaymentTransaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "PessoaFisica" DROP CONSTRAINT "PessoaFisica_userId_CPF_email_fkey";

-- DropForeignKey
ALTER TABLE "PessoaJuridica" DROP CONSTRAINT "PessoaJuridica_userId_CNPJ_email_fkey";

-- DropForeignKey
ALTER TABLE "Schools" DROP CONSTRAINT "Schools_ownerUserId_fkey";

-- DropForeignKey
ALTER TABLE "Socios" DROP CONSTRAINT "Socios_userId_pessoaJuridicaId_fkey";

-- DropForeignKey
ALTER TABLE "Subscriptions" DROP CONSTRAINT "Subscriptions_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "_SchoolsToStudents" DROP CONSTRAINT "_SchoolsToStudents_A_fkey";

-- DropForeignKey
ALTER TABLE "certificates" DROP CONSTRAINT "certificates_certificateCreditId_fkey";

-- DropForeignKey
ALTER TABLE "certificates" DROP CONSTRAINT "certificates_emissorId_emissorDoc_emissorEmail_fkey";

-- DropForeignKey
ALTER TABLE "certificates" DROP CONSTRAINT "certificates_subscriptionId_fkey";

-- AlterTable
ALTER TABLE "Abilities" ALTER COLUMN "habilidadeId" DROP DEFAULT,
ALTER COLUMN "habilidadeId" SET DATA TYPE TEXT,
ALTER COLUMN "ownerId" SET DATA TYPE TEXT;
DROP SEQUENCE "Abilities_habilidadeId_seq";

-- AlterTable
ALTER TABLE "AbilityOnCertificate" DROP CONSTRAINT "AbilityOnCertificate_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "certificateId" SET DATA TYPE TEXT,
ALTER COLUMN "habilidadeId" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "AbilityOnCertificate_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "AbilityOnCertificate_id_seq";

-- AlterTable
ALTER TABLE "AbilityOnReview" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "ownerId" SET DATA TYPE TEXT;
DROP SEQUENCE "AbilityOnReview_id_seq";

-- AlterTable
ALTER TABLE "ApiKeys" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "BlockchainCredits" ALTER COLUMN "blockchainCreditId" DROP DEFAULT,
ALTER COLUMN "blockchainCreditId" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "paymentId" SET DATA TYPE TEXT;
DROP SEQUENCE "BlockchainCredits_blockchainCreditId_seq";

-- AlterTable
ALTER TABLE "BlockchainTransactions" ALTER COLUMN "transactionId" DROP DEFAULT,
ALTER COLUMN "transactionId" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "certificateId" SET DATA TYPE TEXT,
ALTER COLUMN "blockchainCreditId" SET DATA TYPE TEXT,
ALTER COLUMN "subscriptionId" SET DATA TYPE TEXT;
DROP SEQUENCE "BlockchainTransactions_transactionId_seq";

-- AlterTable
ALTER TABLE "CertificatesCredits" ALTER COLUMN "CertificateCreditId" DROP DEFAULT,
ALTER COLUMN "CertificateCreditId" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "paymentId" SET DATA TYPE TEXT;
DROP SEQUENCE "CertificatesCredits_CertificateCreditId_seq";

-- AlterTable
ALTER TABLE "CertificatesSharing" ALTER COLUMN "hashId" DROP DEFAULT,
ALTER COLUMN "hashId" SET DATA TYPE TEXT,
ALTER COLUMN "certificateId" SET DATA TYPE TEXT;
DROP SEQUENCE "CertificatesSharing_hashId_seq";

-- AlterTable
ALTER TABLE "DocumentsPictures" DROP CONSTRAINT "DocumentsPictures_pkey",
ALTER COLUMN "documentId" DROP DEFAULT,
ALTER COLUMN "documentId" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "DocumentsPictures_pkey" PRIMARY KEY ("documentId");
DROP SEQUENCE "DocumentsPictures_documentId_seq";

-- AlterTable
ALTER TABLE "EvidenceOpenBadge" ALTER COLUMN "certificateId" SET DATA TYPE TEXT,
ALTER COLUMN "createdByUser" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "NarrativeOpenBadge" ALTER COLUMN "certificateId" SET DATA TYPE TEXT,
ALTER COLUMN "createdByUser" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "PagarmeCustomers" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "PaymentTransaction" ALTER COLUMN "paymentId" DROP DEFAULT,
ALTER COLUMN "paymentId" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT;
DROP SEQUENCE "PaymentTransaction_paymentId_seq";

-- AlterTable
ALTER TABLE "PessoaFisica" DROP CONSTRAINT "PessoaFisica_pkey",
ALTER COLUMN "idPF" DROP DEFAULT,
ALTER COLUMN "idPF" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "PessoaFisica_pkey" PRIMARY KEY ("idPF");
DROP SEQUENCE "PessoaFisica_idPF_seq";

-- AlterTable
ALTER TABLE "PessoaJuridica" DROP CONSTRAINT "PessoaJuridica_pkey",
ALTER COLUMN "idPJ" DROP DEFAULT,
ALTER COLUMN "idPJ" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "PessoaJuridica_pkey" PRIMARY KEY ("idPJ");
DROP SEQUENCE "PessoaJuridica_idPJ_seq";

-- AlterTable
ALTER TABLE "Schools" ALTER COLUMN "ownerUserId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Socios" ALTER COLUMN "pessoaJuridicaId" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Subscriptions" ALTER COLUMN "subscriptionId" DROP DEFAULT,
ALTER COLUMN "subscriptionId" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "transactionId" SET DATA TYPE TEXT;
DROP SEQUENCE "Subscriptions_subscriptionId_seq";

-- AlterTable
ALTER TABLE "_SchoolsToStudents" ALTER COLUMN "A" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "certificates" DROP CONSTRAINT "certificates_pkey",
ALTER COLUMN "receptorId" SET DATA TYPE TEXT,
ALTER COLUMN "emissorId" SET DATA TYPE TEXT,
ALTER COLUMN "certificateId" DROP DEFAULT,
ALTER COLUMN "certificateId" SET DATA TYPE TEXT,
ALTER COLUMN "certificateCreditId" SET DATA TYPE TEXT,
ALTER COLUMN "subscriptionId" SET DATA TYPE TEXT,
ADD CONSTRAINT "certificates_pkey" PRIMARY KEY ("certificateId");
DROP SEQUENCE "certificates_certificateId_seq";

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "users_id_seq";

-- AddForeignKey
ALTER TABLE "PessoaFisica" ADD CONSTRAINT "PessoaFisica_userId_CPF_email_fkey" FOREIGN KEY ("userId", "CPF", "email") REFERENCES "users"("id", "numeroDocumento", "email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PessoaJuridica" ADD CONSTRAINT "PessoaJuridica_userId_CNPJ_email_fkey" FOREIGN KEY ("userId", "CNPJ", "email") REFERENCES "users"("id", "numeroDocumento", "email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Socios" ADD CONSTRAINT "Socios_userId_pessoaJuridicaId_fkey" FOREIGN KEY ("userId", "pessoaJuridicaId") REFERENCES "PessoaJuridica"("userId", "idPJ") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schools" ADD CONSTRAINT "Schools_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "PessoaJuridica"("idPJ") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKeys" ADD CONSTRAINT "ApiKeys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentsPictures" ADD CONSTRAINT "DocumentsPictures_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_emissorId_emissorDoc_emissorEmail_fkey" FOREIGN KEY ("emissorId", "emissorDoc", "emissorEmail") REFERENCES "users"("id", "numeroDocumento", "email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_certificateCreditId_fkey" FOREIGN KEY ("certificateCreditId") REFERENCES "CertificatesCredits"("CertificateCreditId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscriptions"("subscriptionId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceOpenBadge" ADD CONSTRAINT "EvidenceOpenBadge_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "certificates"("certificateId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NarrativeOpenBadge" ADD CONSTRAINT "NarrativeOpenBadge_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "certificates"("certificateId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbilityOnCertificate" ADD CONSTRAINT "AbilityOnCertificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbilityOnCertificate" ADD CONSTRAINT "AbilityOnCertificate_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "certificates"("certificateId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbilityOnCertificate" ADD CONSTRAINT "AbilityOnCertificate_habilidadeId_fkey" FOREIGN KEY ("habilidadeId") REFERENCES "Abilities"("habilidadeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificatesSharing" ADD CONSTRAINT "CertificatesSharing_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "certificates"("certificateId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CertificatesCredits" ADD CONSTRAINT "CertificatesCredits_userId_paymentId_paymentDate_fkey" FOREIGN KEY ("userId", "paymentId", "paymentDate") REFERENCES "PaymentTransaction"("userId", "paymentId", "createdAt") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockchainCredits" ADD CONSTRAINT "BlockchainCredits_userId_paymentId_paymentDate_fkey" FOREIGN KEY ("userId", "paymentId", "paymentDate") REFERENCES "PaymentTransaction"("userId", "paymentId", "createdAt") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscriptions" ADD CONSTRAINT "Subscriptions_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "PaymentTransaction"("paymentId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockchainTransactions" ADD CONSTRAINT "BlockchainTransactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockchainTransactions" ADD CONSTRAINT "BlockchainTransactions_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "certificates"("certificateId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockchainTransactions" ADD CONSTRAINT "BlockchainTransactions_blockchainCreditId_fkey" FOREIGN KEY ("blockchainCreditId") REFERENCES "BlockchainCredits"("blockchainCreditId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockchainTransactions" ADD CONSTRAINT "BlockchainTransactions_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscriptions"("subscriptionId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagarmeCustomers" ADD CONSTRAINT "PagarmeCustomers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SchoolsToStudents" ADD CONSTRAINT "_SchoolsToStudents_A_fkey" FOREIGN KEY ("A") REFERENCES "PessoaFisica"("idPF") ON DELETE CASCADE ON UPDATE CASCADE;
