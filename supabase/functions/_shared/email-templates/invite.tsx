/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import { styles } from './_styles.ts'

interface Props {
  siteName?: string
  siteUrl?: string
  confirmationUrl: string
}

export const InviteEmail = ({ confirmationUrl }: Props) => (
  <Html lang="he" dir="rtl">
    <Head />
    <Preview>הוזמנת להצטרף למועדון Aluma</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Section style={styles.header}>
          <Heading style={styles.brand}>ALUMA</Heading>
          <Text style={styles.tagline}>Outdoor Living</Text>
        </Section>
        <Section style={styles.body}>
          <Heading style={styles.h1}>הוזמנת להצטרף</Heading>
          <Text style={styles.text}>
            קיבלת הזמנה אישית להצטרף למועדון אלומה. לחצו על הכפתור להשלמת ההרשמה.
          </Text>
          <Section style={styles.buttonWrap}>
            <Button style={styles.button} href={confirmationUrl}>
              קבלת ההזמנה
            </Button>
          </Section>
        </Section>
      </Container>
      <Text style={styles.outerFooter}>© Aluma Outdoor Living</Text>
    </Body>
  </Html>
)

export default InviteEmail
