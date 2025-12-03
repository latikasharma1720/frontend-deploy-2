// src/utils/data.js
const LS = {
  get(k, fb) { try { return JSON.parse(localStorage.getItem(k)) ?? fb; } catch { return fb; } },
  set(k, v)  { localStorage.setItem(k, JSON.stringify(v)); }
};

const kProfile  = (uid) => `profile:${uid}`;
const kSettings = (uid) => `settings:${uid}`;

export function getProfile(uid) {
  return LS.get(kProfile(uid), { name:"", studentId:"", email:"", phone:"" });
}
export function saveProfile(uid, profile) {
  LS.set(kProfile(uid), profile);
  return profile;
}

export function getSettings(uid) {
  return LS.get(kSettings(uid), { rideAlerts:true, marketing:false });
}
export function saveSettings(uid, s) {
  LS.set(kSettings(uid), s);
  return s;
}
