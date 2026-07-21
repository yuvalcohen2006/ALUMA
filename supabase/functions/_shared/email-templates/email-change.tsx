/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import { styles } from './_styles.ts'

interface Props {
  siteName?: string
  email?: string
  oldEmail?: string
  newEmail?: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({ newEmail, confirmationUrl }: Props) => (
  <Html lang="he" dir="rtl">
    <Head />
    <Preview>אישור שינוי כתובת המייל ב־Aluma</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Section style={styles.header}>
          <Heading style={styles.brand}>ALUMA</Heading>
          <Text style={styles.tagline}>Outdoor Living</Text>
        </Section>
        <Section style={styles.body}>
          <Heading style={styles.h1}>אישור שינוי כתובת מייל</Heading>
          <Text style={styles.text}>
            התבקש שינוי כתובת המייל בחשבונך במועדון אלומה{newEmail ? ` לכתובת ${newEmail}` : ''}.
            לאישור השינוי לחצו על הכפתור.
          </Text>
          <Section style={styles.buttonWrap}>
            <Button style={styles.button} href={confirmationUrl}>
              אישור שינוי הכתובת
            </Button>
          </Section>
          <Text style={styles.footer}>אם לא ביקשת את השינוי, ניתן להתעלם ממייל זה.</Text>
        </Section>
      </Container>
      <Text style={styles.outerFooter}>© Aluma Outdoor Living</Text>
    </Body>
  </Html>
)

export default EmailChangeEmail
