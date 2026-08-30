import { describe, expect, it } from "vitest";
import { contactSchema } from "./contactSchema";

const valid = {
  name: "דנה כהן",
  phone: "050-451-9062",
  email: "",
  message: "",
  website: "",
};

/** What the form actually sends: every field a string, empty ones as "". */
const submit = (over: Partial<typeof valid> = {}) =>
  contactSchema.safeParse({ ...valid, ...over });

describe("the contact form's rules", () => {
  it("accepts a name and a mobile number and nothing else", () => {
    expect(submit().success).toBe(true);
  });

  it.each([
    ["050-451-9062", "with dashes"],
    ["0504519062", "run together"],
    ["050 451 9062", "with spaces"],
    ["+972504519062", "international"],
    ["+972-50-451-9062", "international with dashes"],
    ["03-1234567", "a landline"],
  ])("accepts %s (%s)", (phone) => {
    expect(submit({ phone }).success).toBe(true);
  });

  it.each(["123", "not a phone", "0501234", "05012345678"])(
    "rejects %s",
    (phone) => {
      expect(submit({ phone }).success).toBe(false);
    },
  );

  it("accepts a real email when one is given", () => {
    expect(submit({ email: "dana@example.com" }).success).toBe(true);
  });

  it("accepts a message when one is given", () => {
    expect(submit({ message: "אשמח להצעת מחיר לסלון חוץ." }).success).toBe(true);
  });

  it("treats an untouched email field as no email at all", () => {
    // The field is optional, and the browser sends "" for an empty input.
    expect(submit({ email: "" }).success).toBe(true);
  });

  it("still rejects a half-typed email", () => {
    expect(submit({ email: "dana@" }).success).toBe(false);
  });

  it("rejects a filled honeypot without complaining to a human about it", () => {
    expect(submit({ website: "http://spam.example" }).success).toBe(false);
  });

  it("says what is wrong in words the person can act on", () => {
    const result = submit({ phone: "123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/טלפון/);
    }
  });
});
