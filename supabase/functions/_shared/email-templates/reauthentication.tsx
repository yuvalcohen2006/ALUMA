/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import { styles } from './_styles.ts'

interface Props {
  token?: string
}

export const ReauthenticationEmail = ({ token }: Props) => (
  <Html lang="he" dir="rtl">
    <Head />
    <Preview>קוד אימות ל־Aluma</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Section style={styles.header}>
          <Heading style={styles.brand}>ALUMA</Heading>
          <Text style={styles.tagline}>Outdoor Living</Text>
        </Section>
        <Section style={styles.body}>
          <Heading style={styles.h1}>קוד האימות שלך</Heading>
          <Text style={styles.text}>הזן את הקוד הבא כדי להשלים את פעולת האימות:</Text>
          <Text style={styles.code}>{token}</Text>
          <Text style={styles.footer}>הקוד בתוקף לזמן קצר. אם לא ביקשת קוד, ניתן להתעלם ממייל זה.</Text>
        </Section>
      </Container>
      <Text style={styles.outerFooter}>© Aluma Outdoor Living</Text>
    </Body>
  </Html>
)

export default ReauthenticationEmail
