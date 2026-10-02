import { readJSON, readArray, writeJSON } from "./storage.js";
import { STORAGE_KEYS } from "./config.js";
// wonandonly의 members 키를 유지하여 기존 가입 정보를 보존합니다.
export const MEMBERS_KEY = "enjoytrip:v1:members";
export function setSession(userId) {
  sessionStorage.removeItem(STORAGE_KEYS.planDraft);
  writeJSON(sessionStorage, STORAGE_KEYS.session, { userId });
}
export function getCurrentUser() {
  const session = readJSON(sessionStorage, STORAGE_KEYS.session, null);
  if (!session) return null;
  const member = readArray(localStorage, MEMBERS_KEY).find(member => member.id === session.userId);
  if (!member) { clearSession(); return null; }
  return { id: member.id, nickname: member.nickname, email: member.email };
}
export function clearSession() {
  sessionStorage.removeItem(STORAGE_KEYS.session);
  sessionStorage.removeItem(STORAGE_KEYS.planDraft);
}
