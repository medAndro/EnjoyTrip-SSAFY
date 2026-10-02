import { getCurrentUser, clearSession } from "./session.js";
try {
  const user = getCurrentUser();
  document.querySelectorAll('[data-auth-link]').forEach(link => { link.hidden = Boolean(user); });
  const name = document.querySelector('[data-session-user]'), logout = document.querySelector('[data-logout]');
  if (name) { name.hidden = !user; name.textContent = user ? `${user.nickname}님` : ""; }
  if (logout) {
    logout.hidden = !user;
    logout.addEventListener("click", () => { clearSession(); location.href = "./index.html"; });
  }
} catch {
  const notice = document.createElement("p"); notice.className = "container danger";
  notice.textContent = "회원 정보를 읽지 못했습니다. 브라우저 저장소 상태를 확인해주세요.";
  document.querySelector("main")?.prepend(notice);
}
