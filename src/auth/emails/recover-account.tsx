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
  Tailwind,
  Text,
  pixelBasedPreset,
} from "@react-email/components";

export const RecoverAccount = ({ url }: { url: string }) => (
  <Html>
    <Head />
    <Tailwind
      config={{
        presets: [pixelBasedPreset],
        theme: {
          extend: {
            colors: {
              primary: "oklch(0.255 0 0)",
            },
          },
        },
      }}
    >
      <Body className="font-sans">
        <Preview>Reset your Tracktrip password</Preview>
        <Container className="mx-auto my-0 max-w-[560px] px-0 pt-5 pb-12">
          <Img
            src="https://tracktrip.app/icons/pwa-64x64.png"
            alt="Tracktrip icon"
            width="32"
            height="32"
            className="rounded"
          />
          <Heading className="text-[24px] tracking-[-0.5px] leading-[1.3] font-normal pt-[17px] px-0 pb-0">
            Reset your Tracktrip password
          </Heading>
          <Section className="py-[27px] px-0">
            <Button
              className="bg-primary rounded font-semibold text-white text-[15px] no-underline text-center block py-[11px] px-[23px]"
              href={url}
            >
              Reset my password
            </Button>
          </Section>
          <Text className="mb-[15px] mx-0 mt-0 leading-[1.4] text-[15px]">
            This link will only be valid for the next 5 minutes. If the link
            does not work, you can contact the support easily at
            support@tracktrip.app.
          </Text>
          <Hr className="border-[#dfe1e4] mt-[42px] mb-[26px]" />
          <Link
            href="https://tracktrip.app"
            className="inline-flex font-semibold text-primary"
          >
            <Img
              src="https://tracktrip.app/icons/pwa-64x64.png"
              alt="Tracktrip icon"
              width="16"
              height="16"
              className="rounded mt-0.5 mr-2"
            />
            Tracktrip
          </Link>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

RecoverAccount.PreviewProps = {
  url: "https://localhost:3000/auth/reset-password?token=1234567890",
};

export default RecoverAccount;

