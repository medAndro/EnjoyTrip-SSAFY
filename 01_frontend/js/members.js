// 담당 B — F107/F108. 페이지별 body.dataset.page 값으로 초기화를 구분합니다.
// signup: 폼 검증 → ID 중복 확인 → 샘플 회원 저장.
// login: 샘플 회원 대조 → sessionStorage에 userId 저장 → 화면 이동.
// recover: ID+샘플 이메일 확인 → 새 데모 비밀번호 설정(실제 메일 발송 없음).
// mypage: 로그인 확인 → 내 정보 표시 → 수정/탈퇴.
// 탈퇴: 현재 회원을 지우고 계획/Hotplace 배열에서 ownerId가 같은 항목을 제거합니다.
// 사용자 입력은 innerHTML 대신 textContent/value로 반영합니다.
// 실제 submit 리스너 연결 시 data-preview-form 속성과 해당 disabled를 제거합니다.

import { readJSON, writeJSON } from "./storage.js";
import { setSession } from "./session.js";

const MEMBERS_KEY = "enjoytrip:v1:members";

// 1. 회원가입
export function signup(){
  console.log("signup 실행됨");
  const inputId=document.querySelector("#user-id");
  const inputNickname=document.querySelector("#nickname");
  const inputEmail=document.querySelector("#email");
  const inputPw=document.querySelector("#password");
  const inputPw2=document.querySelector("#password-confirm");
  const message = document.querySelector(".hint");

  //빠진 값 있는지 확인
  if (
    !inputId.value ||
    !inputNickname.value ||
    !inputEmail.value ||
    !inputPw.value ||
    !inputPw2.value
  ) {
    alert("모든 값을 입력해주세요.");
    return null;
  }

  //id 중복 확인
  const members = readJSON(MEMBERS_KEY, []);
  const member=members.find(
    member=>member.id===inputId.value
  );

  if(member){
    alert("이미 사용 중인 아이디입니다.");
    return null;
  }
  //아니면 다음 검증으로 넘어감 

  //비밀번호 일치 확인
  if(inputPw.value !== inputPw2.value){
    alert("비밀번호가 일치하지 않습니다.");
    return null;
  } 

  //멤버 저장: const members = readJSON(MEMBERS_KEY, []); 니까 배열로 저장해줌 
  members.push({
    id: inputId.value,
    nickname: inputNickname.value,
    email: inputEmail.value,
    password: inputPw.value
  });

  writeJSON(MEMBERS_KEY, members);
  alert("회원가입이 완료되었습니다.");
  location.href = "index.html";
}

const form = document.querySelector("#signup-form");
if(form){
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    signup();
  });
}


// 2. 로그인
//샘플 회원 대조 → sessionStorage에 userId 저장 → 화면 이동.
export function login(){
  console.log("로그인 함수 실행");
  const inputId=document.querySelector("#user-id");
  const inputPw=document.querySelector("#password");

  const members=readJSON(MEMBERS_KEY,[]);
  const member=members.find(
    member=>member.id===inputId.value
  );
  
  //계정 존재 시 비밀번호 일치 여부 판별
  if(member){
    if(member.password!==inputPw.value){
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    setSession(inputId.value)
    alert("로그인 완료!");
    location.href = "index.html";
  }

  else{
    //계정 존재 x
    alert("회원 정보가 존재하지 않습니다.");
    return;
  }
}

const loginform = document.querySelector("#login-form");
if(loginform){
  loginform.addEventListener("submit", (event) => {
    event.preventDefault();
    login();
  });
}
