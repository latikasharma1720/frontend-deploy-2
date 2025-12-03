export function setUser(user) {
  sessionStorage.setItem("mastoride_user", JSON.stringify(user));
}

export function getUser() {
  const user = sessionStorage.getItem("mastoride_user");
  return user ? JSON.parse(user) : null;
}

export function clearUser() {
  sessionStorage.removeItem("mastoride_user");
}
