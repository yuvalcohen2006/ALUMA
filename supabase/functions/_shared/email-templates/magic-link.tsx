/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import { styles } from './_styles.ts'

interface Props {
  siteName?: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ confirmationUrl }: Props) => (
  <Html lang="he" dir="rtl">
    <Head />
    <Preview>קישור הכניסה שלך ל־Aluma</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Section style={styles.header}>
          <Heading style={styles.brand}>ALUMA</Heading>
          <Text style={styles.tagline}>Outdoor Living</Text>
        </Section>
        <Section style={styles.body}>
          <Heading style={styles.h1}>קישור הכניסה שלך</Heading>
          <Text style={styles.text}>
            לחיצה על הכפתור תכניס אותך למועדון אלומה. הקישור בתוקף לזמן מוגבל.
          </Text>
          <Section style={styles.buttonWrap}>
            <Button style={styles.button} href={confirmationUrl}>
              כניסה לחשבון
            </Button>
          </Section>
          <Text style={styles.footer}>אם לא ביקשת קישור זה, ניתן להתעלם ממייל זה.</Text>
        </Section>
      </Container>
      <Text style={styles.outerFooter}>© Aluma Outdoor Living</Text>
    </Body>
  </Html>
)

export default MagicLinkEmail
