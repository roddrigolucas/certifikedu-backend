import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface AdminNewUserVerificationProps {
  var1: string;
  var2: string;
  var3: string;
}

const baseUrl = process.env.ASSETS_URL || 'https://d1lvltvaf98pvm.cloudfront.net';

export default function AdminNewUserVerification ({
  var1,
  var2,
  var3,
}: AdminNewUserVerificationProps) {
  return (
    <Html>
      <Head />
      <Preview>CertifikEdu Admin Verify New User</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={coverSection}>
            <Section style={imageSection}>
              <Img
                src={`${baseUrl}/email-images/certifikedu-logo.png`}
                width="129"
                height="26"
                alt="certifik-logo"
                style={logo}
              />
            </Section>
            <Heading style={h1}>{var1}</Heading><Hr />
            <Section style={upperSection}>
              <Text style={mainText}>{var2}</Text>
              <Text style={subMainText}>{var3}</Text>
              <Button style={button} href="https://app.certifikedu.com/">
                {"{{ email }}"}
              </Button>
            </Section>
            <Section style={lowerSection}>
              <Text style={cautionText}>
                Este e-mail foi enviado automaticamente.
              </Text>
            </Section>
          </Section>
          <Section style={footerSection}>
            <Text style={footerText}>
              Agradecemos,<br />Equipe CertifikEDU<br /> {" "}
              <Link href="https://www.certifikedu.com" target="_blank" style={link}>
                www.certifikedu.com
              </Link>
              <br />Todos os direitos reservados
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#FFFF",
  color: "#212121",
};

const container = {
  padding: "20px",
  margin: "0 auto",
  backgroundColor: "#F8F9FA",
};

const logo = {
  margin: "0 auto",
};

const imageSection = {
  backgroundColor: "#1B223B",
  padding: "10px 0",
};

const h1 = {
  color: "#1B223B",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "30px",
  fontWeight: "bold",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
  margin: "24px 0",
  alignItems: "center",
};

const mainText = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "30px",
  margin: "24px 0",
  alignItems: "center",
  marginBottom: "10px",
  textAlign: "center" as const,
};

const button = {
  ...text,
  color: "#FFFF",
  fontWeight: "bold",
  letterSpacing: "0.05em",
  backgroundColor: "#FF7C21",
  borderRadius: "5px",
  textAlign: "center" as const,
  display: "block",
  margin: "0 auto",
  width: "100%",
  padding: "10px auto",
};

const coverSection = { backgroundColor: "#FFFF" };

const upperSection = { padding: "25px 35px" };

const subMainText = { ...text, marginBottom: "10px", fontWeight: "bold", textAlign: "center" as const };

const lowerSection = { padding: "25px 35px", backgroundColor: "#FFE5D380" };

const cautionText = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
  margin: "0px",
  alignItems: "center",
  textAlign: "center" as const,
};

const link = {
  color: "#FF7C21",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
  textDecoration: "underline",
};

const footerSection = { padding: "25px 35px", backgroundColor: "#1B223B" };

const footerText = {
  ...text,
  color: "#FFFF",
  margin: "24px 0",
  alignItems: "center",
  fontSize: "12px",
  padding: "0 20px",
  textAlign: "center" as const,
};
