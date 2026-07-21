/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import { BRAND, styles } from './_styles.ts'

interface Props {
  siteName?: string
  siteUrl?: string
  recipient?: string
  confirmationUrl: string
}

export const SignupEmail = ({ recipient, confirmationUrl }: Props) => (
  <Html lang="he" dir="rtl">
    <Head />
    <Preview>ברוכים הבאים ל־Aluma — אימות כתובת המייל</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Section style={styles.header}>
          <Heading style={styles.brand}>ALUMA</Heading>
          <Text style={styles.tagline}>Outdoor Living</Text>
        </Section>
        <Section style={styles.body}>
          <Heading style={styles.h1}>ברוכים הבאים למועדון אלומה</Heading>
          <Text style={styles.text}>
            שמחים שהצטרפת אלינו. כדי להשלים את ההרשמה ולפתוח את חשבונך במועדון, נבקש לאשר את כתובת המייל
            {recipient ? ` (${recipient})` : ''}.
          </Text>
          <Section style={styles.buttonWrap}>
            <Button style={styles.button} href={confirmationUrl}>
              אישור כתובת המייל
            </Button>
          </Section>
          <Text style={styles.text}>
            כחבר מועדון תוכל לעקוב אחר סטטוס הזמנות, לשמור מוצרים אהובים וליהנות מהטבות בלעדיות.
          </Text>
          <Text style={styles.footer}>
            אם לא נרשמת ל־Aluma, ניתן להתעלם ממייל זה.
          </Text>
        </Section>
      </Container>
      <Text style={styles.outerFooter}>
        © Aluma Outdoor Living · לפנייה חוזרת ניתן להשיב למייל זה
      </Text>
    </Body>
  </Html>
)

export default SignupEmail
