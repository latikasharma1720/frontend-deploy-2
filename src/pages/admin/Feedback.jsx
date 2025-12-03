import { useEffect, useState } from "react";
import { listTickets, closeTicket } from "../../utils/mockApi";

export default function Feedback() {
  const [tickets, setTickets] = useState([]);
  const load = () => listTickets().then(setTickets);
  useEffect(load, []);

  return (
    <section>
      <h2>User Feedback / Support Tickets</h2>
      {tickets.length ? (
        <table className="table">
          <thead><tr><th>When</th><th>User ID</th><th>Message</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {tickets.slice().reverse().map(t=>(
              <tr key={t.id}>
                <td>{new Date(t.ts).toLocaleString()}</td>
                <td>{t.userId}</td>
                <td>{t.message}</td>
                <td>{t.status}</td>
                <td>
                  {t.status!=="closed" && (
                    <button className="btn small" onClick={async ()=>{ await closeTicket(t.id); load(); }}>
                      Close
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : <p>No tickets yet.</p>}
    </section>
  );
}
