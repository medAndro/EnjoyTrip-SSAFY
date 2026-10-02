// 담당 B(초기 구현), A(교차 리뷰).
// session.js를 완성한 뒤 공통 메뉴에 현재 회원명/로그아웃 버튼을 표시합니다.
// 공통 헤더의 data-session-user / data-auth-link / data-logout을 사용합니다.
// logout 클릭 → clearSession → 로그인 전 메뉴로 변경.
// 프레임워크/라우터/템플릿 엔진은 도입하지 않습니다.
import { getCurrentUser, clearSession } from "./session.js";

const authLinks = document.querySelectorAll("[data-auth-link]");
const sessionUser = document.querySelector("[data-session-user]");
const logoutButton = document.querySelector("[data-logout]");

const currentUser = getCurrentUser();

if (currentUser) {
  // 로그인 상태
  authLinks.forEach((link) => {
    link.hidden = true;
  });

  sessionUser.hidden = false;
  sessionUser.textContent = `${currentUser.nickname}님`;

  logoutButton.hidden = false;

  logoutButton.addEventListener("click", () => {
    console.log("로그아웃 버튼 클릭됨");
    clearSession();
    location.reload();
  });
} else {
  // 로그아웃 상태
  authLinks.forEach((link) => {
    link.hidden = false;
  });

  sessionUser.hidden = true;
  logoutButton.hidden = true;
}

