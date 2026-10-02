export function status(node, message, error = false) {
  if (!node) return;
  node.textContent = message;
  node.classList.toggle("danger", error);
}
export function element(tag, text = "", className = "") {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}
export function safeImage(src) {
  if (/^http:\/\//i.test(src || "")) return src.replace(/^http:/i, "https:");
  if (/^https:\/\//i.test(src || "") || /^data:image\/(jpeg|png|webp);base64,/i.test(src || "")) return src;
  return "./assets/images/travel-landscape.svg";
}
