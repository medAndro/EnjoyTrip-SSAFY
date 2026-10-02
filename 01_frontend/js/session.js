// 담당 B — 회원 기능과 별도로 공통 로그인 계약을 먼저 구현하세요.
// getCurrentUser() → { id, nickname, email } 또는 null (비밀번호는 반환하지 않음)
// setSession(userId) → sessionStorage에 { userId } 저장
// clearSession() → enjoytrip:v1:session 및 enjoytrip:v1:plan-draft 키 삭제
// 회원 A/B가 개발 시 공유할 데모 계정은 B의 가입 화면으로 생성합니다.
import {readJSON} from "./storage.js";

const SESSION_KEY = "enjoytrip:v1:session";
const MEMBERS_KEY = "enjoytrip:v1:members";
const PLAN_DRAFT_KEY = "enjoytrip:v1:plan-draft";

//현재 로그인한 회원의 세션 저장
export function setSession(userId){
  sessionStorage.setItem(
    SESSION_KEY, 
    JSON.stringify({userId})
  );
}

//현재 세션의 userId와 같은 userId를 가진 member을 가져와서 id, nickname, email 반환
export function getCurrentUser(){
  const json=sessionStorage.getItem(SESSION_KEY);
  if(json==null){
    return null;
  }
  //json이 null이 아니면 parse 
  const session=JSON.parse(json);

  const members = readJSON(MEMBERS_KEY, []);

  const member=members.find(
    member=>member.id==session.userId
  );

  if(!member){
    return null;
  }

  return {
    id: member.id,
    nickname: member.nickname,
    email: member.email
  };
}

//로그아웃 -> enjoytrip:v1:session 및 enjoytrip:v1:plan-draft 키 삭제
export function clearSession(){
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(PLAN_DRAFT_KEY);
}