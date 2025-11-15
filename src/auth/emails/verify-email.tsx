import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
  pixelBasedPreset,
} from "@react-email/components";

export const VerifyEmail = ({ url }: { url: string }) => (
  <Html>
    <Head />
    <Tailwind
      config={{
        presets: [pixelBasedPreset],
        theme: {
          extend: {
            colors: {
              background: "oklch(0.255 0 0)",
            },
          },
        },
      }}
    >
      <Body className="bg-background font-sans">
        <Preview>Your login code for Linear</Preview>
        <Container className="mx-auto my-0 max-w-[560px] px-0 pt-5 pb-12">
          <div className="size-6 rounded-full bg-white mb-2" />
          <Heading className="text-[24px] tracking-[-0.5px] leading-[1.3] font-normal text-white pt-[17px] px-0 pb-0">
            Verify your email address for Tracktrip
          </Heading>
          <Section className="py-[27px] px-0">
            <Button
              className="bg-white rounded font-semibold text-background text-[15px] no-underline text-center block py-[11px] px-[23px]"
              href={url}
            >
              Verify my email
            </Button>
          </Section>
          <Text className="mb-[15px] mx-0 mt-0 leading-[1.4] text-[15px] text-white">
            This link will only be valid for the next 5 minutes. If the link
            does not work, you can contact the support easily at
            support@tracktrip.app.
          </Text>
          <Hr className="border-[#dfe1e4] mt-[42px] mb-[26px]" />
          <Link
            href="https://tracktrip.app"
            className="text-white inline-flex font-semibold"
          >
            <div className="size-3 rounded-full bg-white mt-1 mr-2" />
            Tracktrip
          </Link>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

VerifyEmail.PreviewProps = {
  url: "https://localhost:3000/auth/verify-email?token=1234567890",
};

export default VerifyEmail;
