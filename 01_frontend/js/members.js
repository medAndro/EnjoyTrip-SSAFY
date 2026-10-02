// wonandonly의 가입·로그인·정보 수정·탈퇴 흐름을 유지하고 통합 오류 및 재설정을 보완했습니다.
import { readArray, writeJSON } from "./storage.js";
import { getCurrentUser, setSession, clearSession, MEMBERS_KEY } from "./session.js";
import { STORAGE_KEYS } from "./config.js";
import { status } from "./ui.js";
const value = id => document.querySelector(`#${id}`).value.trim();
const password = id => document.querySelector(`#${id}`).value;
function bind(id, action) {
  const form = document.querySelector(`#${id}`); if (!form) return;
  form.addEventListener("submit", event => {
    event.preventDefault();
    try { action(form); } catch (error) { status(form.querySelector('[role="status"]'), error.message, true); }
  });
}
function validateProfile(id, nickname, email) {
  if (!id || !nickname || !email) throw new Error("필수 항목을 입력해주세요.");
  if (!/^[A-Za-z0-9_-]{4,20}$/.test(id)) throw new Error("아이디는 영문·숫자·밑줄·하이픈 4~20자로 입력해주세요.");
  if (nickname.length > 20 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("닉네임 길이 또는 이메일 형식을 확인해주세요.");
}
function validatePassword(first, second) {
  if (first.length < 8) throw new Error("비밀번호는 8자 이상 입력해주세요.");
  if (first !== second) throw new Error("비밀번호 확인이 일치하지 않습니다.");
}
bind("signup-form", () => {
  const id = value("user-id"), nickname = value("nickname"), email = value("email");
  validateProfile(id, nickname, email); validatePassword(password("password"), password("password-confirm"));
  const members = readArray(localStorage, MEMBERS_KEY);
  if (members.some(member => member.id === id)) throw new Error("이미 사용 중인 아이디입니다.");
  members.push({ id, nickname, email, password: password("password") });
  writeJSON(localStorage, MEMBERS_KEY, members); location.href = "./login.html?signup=done";
});
bind("login-form", () => {
  const member = readArray(localStorage, MEMBERS_KEY).find(member => member.id === value("user-id") && member.password === password("password"));
  if (!member) throw new Error("아이디 또는 비밀번호가 일치하지 않습니다.");
  setSession(member.id); location.href = "./index.html";
});
bind("recover-form", form => {
  const members = readArray(localStorage, MEMBERS_KEY);
  const member = members.find(member => member.id === value("recover-id") && member.email === value("recover-email"));
  if (!member) throw new Error("아이디와 이메일이 일치하는 회원이 없습니다.");
  validatePassword(password("new-password"), password("new-password-confirm"));
  member.password = password("new-password"); writeJSON(localStorage, MEMBERS_KEY, members);
  form.reset(); status(form.querySelector('[role="status"]'), "데모 비밀번호가 변경되었습니다. 새 비밀번호로 로그인하세요.");
});
const profile = document.querySelector("#profile-form");
if (profile) {
  try {
    const user = getCurrentUser();
    if (!user) { location.replace("./login.html"); }
    else {
      for (const [id, text] of [["user-id", user.id], ["nickname", user.nickname], ["email", user.email]]) document.querySelector(`#${id}`).value = text;
      document.querySelector("#profile-nickname").textContent = user.nickname;
      document.querySelector("#profile-id").textContent = user.id;
      bind("profile-form", form => {
        const members = readArray(localStorage, MEMBERS_KEY), member = members.find(item => item.id === user.id);
        if (!member) throw new Error("회원 정보를 찾을 수 없습니다.");
        validateProfile(user.id, value("nickname"), value("email"));
        if (password("password") || password("password2")) {
          validatePassword(password("password"), password("password2")); member.password = password("password");
        }
        member.nickname = value("nickname"); member.email = value("email"); writeJSON(localStorage, MEMBERS_KEY, members);
        document.querySelector("#profile-nickname").textContent = member.nickname;
        const menuUser = document.querySelector('[data-session-user]'); if (menuUser) menuUser.textContent = `${member.nickname}님`;
        document.querySelector("#password").value = ""; document.querySelector("#password2").value = "";
        status(form.querySelector('[role="status"]'), "회원 정보를 저장했습니다.");
      });
      document.querySelector("#withdraw").addEventListener("click", () => {
        if (!confirm("회원과 본인의 여행 계획·Hotplace를 삭제할까요?")) return;
        const keys = [MEMBERS_KEY, STORAGE_KEYS.plans, STORAGE_KEYS.hotplaces];
        const before = keys.map(key => localStorage.getItem(key));
        try {
          // 먼저 모든 목록을 검증하고, 저장 실패 시 이전 상태로 복구합니다.
          const records = keys.map(key => readArray(localStorage, key));
          records.forEach((items, index) => writeJSON(localStorage, keys[index], items.filter(item => index === 0 ? item.id !== user.id : item.ownerId !== user.id)));
          clearSession(); location.href = "./index.html";
        } catch (error) {
          keys.forEach((key, index) => { try { if (before[index] === null) localStorage.removeItem(key); else localStorage.setItem(key, before[index]); } catch { /* 저장소 오류는 아래 안내 */ } });
          status(profile.querySelector('[role="status"]'), error.message, true);
        }
      });
    }
  } catch (error) { status(profile.querySelector('[role="status"]'), error.message, true); }
}
