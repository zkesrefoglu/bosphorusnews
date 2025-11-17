import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.25';
import * as React from 'npm:react@18.2.0';

interface WelcomeEmailProps {
  subscriberEmail: string;
}

export const WelcomeEmail = ({ subscriberEmail }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to Bosphorus News - Your Daily Dose of Global Insights</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to Bosphorus News!</Heading>
        
        <Text style={text}>
          Thank you for subscribing to our newsletter. We're thrilled to have you join our community of informed readers.
        </Text>

        <Section style={highlightBox}>
          <Text style={highlightText}>
            🎉 You're now subscribed with: <strong>{subscriberEmail}</strong>
          </Text>
        </Section>

        <Text style={text}>
          <strong>What to expect:</strong>
        </Text>
        
        <Section style={listSection}>
          <Text style={listItem}>📰 Daily curated news from around the world</Text>
          <Text style={listItem}>💼 Business insights and market updates</Text>
          <Text style={listItem}>⚽ Sports highlights and breaking news</Text>
          <Text style={listItem}>💻 Technology trends and innovations</Text>
          <Text style={listItem}>🌍 Exclusive Xtra content and special features</Text>
        </Section>

        <Hr style={hr} />

        <Section style={ctaSection}>
          <Text style={text}>
            Start exploring our latest stories now:
          </Text>
          <Link
            href="https://bosphorusnews.lovable.app"
            target="_blank"
            style={button}
          >
            Visit Bosphorus News
          </Link>
        </Section>

        <Hr style={hr} />

        <Text style={footerText}>
          Stay informed, stay ahead. We deliver the news that matters most to you, right to your inbox.
        </Text>

        <Text style={footer}>
          © 2025 Bosphorus News. All rights reserved.
          <br />
          <Link
            href="https://bosphorusnews.lovable.app"
            target="_blank"
            style={footerLink}
          >
            bosphorusnews.lovable.app
          </Link>
        </Text>

        <Text style={unsubscribeText}>
          If you didn't subscribe to this newsletter, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0 40px',
  lineHeight: '1.3',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
  padding: '0 40px',
};

const highlightBox = {
  backgroundColor: '#f0f7ff',
  borderLeft: '4px solid #2563eb',
  margin: '32px 40px',
  padding: '16px 20px',
  borderRadius: '4px',
};

const highlightText = {
  color: '#1e40af',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
};

const listSection = {
  padding: '0 40px',
  margin: '16px 0',
};

const listItem = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '28px',
  margin: '8px 0',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 40px',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
  marginTop: '16px',
};

const footerText = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '24px 0',
  padding: '0 40px',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '20px',
  marginTop: '32px',
  padding: '0 40px',
  textAlign: 'center' as const,
};

const footerLink = {
  color: '#2563eb',
  textDecoration: 'underline',
};

const unsubscribeText = {
  color: '#ababab',
  fontSize: '12px',
  lineHeight: '18px',
  marginTop: '16px',
  padding: '0 40px',
  textAlign: 'center' as const,
};
