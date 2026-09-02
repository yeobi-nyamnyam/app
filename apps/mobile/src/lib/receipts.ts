import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";

import { supabase } from "./supabase";
import { fetchWithTimeout } from "./fetchWithTimeout";

const RECEIPTS_BUCKET = "receipts";
const serverUrl = process.env.EXPO_PUBLIC_SERVER_URL ?? "http://localhost:4000";
// OCR 인식은 이미지 처리를 기다려야 해서 기본 타임아웃보다 여유를 둔다.
const OCR_TIMEOUT_MS = 30000;

export interface ReceiptOcrResult {
  recognized: boolean;
  storeName: string | null;
  storeAddress: string | null;
  amount: number | null;
  bizNumRecognized: boolean;
}

// 카메라로 촬영하거나 갤러리에서 선택한다. 취소하면 null.
export async function pickReceiptImage(source: "camera" | "library"): Promise<string | null> {
  const permission =
    source === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error("카메라/사진 접근 권한이 필요해요.");
  }

  const result =
    source === "camera"
      ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });

  if (result.canceled) return null;
  return result.assets[0]?.uri ?? null;
}

// F6-2: {trip_id}/{uuid}.jpg 경로로 receipts 버킷에 업로드하고 오브젝트 경로를 반환한다.
export async function uploadReceiptImage(tripId: string, localUri: string): Promise<string> {
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const path = `${tripId}/${Crypto.randomUUID()}.jpg`;

  const { error } = await supabase.storage
    .from(RECEIPTS_BUCKET)
    .upload(path, decode(base64), { contentType: "image/jpeg" });
  if (error) {
    throw new Error("영수증 이미지 업로드에 실패했어요.");
  }
  return path;
}

export async function getReceiptSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(RECEIPTS_BUCKET)
    .createSignedUrl(path, 60);
  if (error || !data) {
    throw new Error("영수증 이미지 URL 발급에 실패했어요.");
  }
  return data.signedUrl;
}

// apps/server의 클로바 OCR 프록시를 호출한다.
export async function recognizeReceipt(imageUrl: string): Promise<ReceiptOcrResult> {
  const response = await fetchWithTimeout(
    `${serverUrl}/record/ocr/receipt`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl }),
    },
    OCR_TIMEOUT_MS,
  );
  if (!response.ok) {
    throw new Error("영수증 인식에 실패했어요.");
  }
  const data = (await response.json()) as ReceiptOcrResult;
  return data;
}
