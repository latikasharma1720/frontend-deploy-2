// mock API for history/profile/rewards/support
function seed() {
  if (localStorage.getItem("mr_seed")) return;
  const users = [
    { id: "u1", name: "Latika", email: "latika@pfw.edu", role: "user" },
    { id: "a1", name: "Admin",  email: "admin@mastoride.app", role: "admin" }
  ];
  const profiles = {
    u1: { name:"Latika", email:"latika@pfw.edu", phone:"", studentId:"", payment:{ cardName:"", cardLast4:"", preferred:"cash" }, settings:{ notifications:true, shareHistory:false } },
    a1: { name:"Admin",  email:"admin@mastoride.app", settings:{ maintenanceMode:false } }
  };
  const history = [
    { id:"h1", userId:"u1", date:"2025-10-01", time:"09:00", from:"Canterbury", to:"Walb", price:2 },
    { id:"h2", userId:"u1", date:"2025-10-03", time:"14:20", from:"Cole", to:"Kettler", price:3 }
  ];
  localStorage.setItem("mr_users", JSON.stringify(users));
  localStorage.setItem("mr_profiles", JSON.stringify(profiles));
  localStorage.setItem("mr_history", JSON.stringify(history));
  localStorage.setItem("mr_rewards", JSON.stringify({ u1:{ points:120, tier:"Silver", nextAt:200 } }));
  localStorage.setItem("mr_tickets", JSON.stringify([]));
  localStorage.setItem("mr_seed","1");
}
seed();

const read = (k, d) => JSON.parse(localStorage.getItem(k) || d);
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

export async function getMyHistory(userId) {
  return read("mr_history","[]").filter(h => h.userId === userId);
}

export async function getProfile(userId) {
  return read("mr_profiles","{}")[userId];
}
export async function saveProfile(userId, data) {
  const p = read("mr_profiles","{}"); p[userId] = data; write("mr_profiles", p); return true;
}

export async function getRewards(userId) {
  const r = read("mr_rewards","{}"); return r[userId] || { points:0, tier:"Bronze", nextAt:100 };
}

export async function submitSupportTicket(userId, message) {
  const list = read("mr_tickets","[]");
  list.push({ id: crypto.randomUUID(), userId, message, ts: Date.now(), status:"open" });
  write("mr_tickets", list);
  return true;
}

export async function listTickets() { return read("mr_tickets","[]"); }
export async function closeTicket(id) {
  const list = read("mr_tickets","[]").map(t => t.id===id?{...t,status:"closed"}:t);
  write("mr_tickets", list);
}
