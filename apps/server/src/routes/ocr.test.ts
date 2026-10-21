import { afterEach, describe, expect, it, vi } from "vitest";
import { isReceiptSignedUrl, parseAmount } from "./ocr";

describe("parseAmount", () => {
  it("콤마/단위 문자를 떼고 숫자만 남긴다", () => {
    expect(parseAmount("31,800원")).toBe(31800);
  });

  it("숫자 문자열 '0'은 0으로 반환한다 (falsy 문자열 함정 주의)", () => {
    expect(parseAmount("0원")).toBe(0);
  });

  it("숫자가 하나도 없으면 null을 반환한다", () => {
    expect(parseAmount("원")).toBeNull();
  });

  it("입력이 없으면 null을 반환한다", () => {
    expect(parseAmount(undefined)).toBeNull();
  });
});

describe("isReceiptSignedUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("우리 Supabase receipts 버킷의 signed URL만 허용한다", () => {
    vi.stubEnv("SUPABASE_URL", "https://abc.supabase.co");
    expect(isReceiptSignedUrl("https://abc.supabase.co/storage/v1/object/sign/receipts/t/1.jpg?token=x")).toBe(true);
  });

  it("다른 호스트나 다른 버킷은 거부한다", () => {
    vi.stubEnv("SUPABASE_URL", "https://abc.supabase.co");
    expect(isReceiptSignedUrl("http://169.254.169.254/latest/meta-data")).toBe(false);
    expect(isReceiptSignedUrl("https://abc.supabase.co.evil.com/storage/v1/object/sign/receipts/a.jpg")).toBe(false);
    expect(isReceiptSignedUrl("https://abc.supabase.co/storage/v1/object/sign/avatars/a.jpg")).toBe(false);
  });

  it("SUPABASE_URL이 없으면 전부 거부한다", () => {
    vi.stubEnv("SUPABASE_URL", "");
    expect(isReceiptSignedUrl("/storage/v1/object/sign/receipts/a.jpg")).toBe(false);
  });
});
