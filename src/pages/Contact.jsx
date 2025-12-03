import React from "react";
export default function Contact() {
  return (
    <main className="container">
      {/* Contact Form */}
      <section className="contact-form">
        <h2>Contact Us</h2>
        <form action="#" method="post">
          <FormField label="Full Name" id="name" type="text" required />
          <FormField label="Email / Phone" id="email" type="text" required />

          <SelectField
            label="I am a:"
            id="role"
            options={["Rider", "Driver"]}
            required
          />

          <FormField
            label="Booking ID (optional)"
            id="booking"
            type="text"
          />

          <SelectField
            label="Issue Type"
            id="issue"
            options={[
              "Payment Issue",
              "Lost Item",
              "Account Issue",
              "Ride Feedback",
              "Other",
            ]}
            required
          />

          <label htmlFor="message">Your Message</label>
          <textarea id="message" name="message" required />

          <button type="submit">Send Message</button>
        </form>
      </section>

      {/* Contact Info */}
      <aside className="contact-info">
        <h2>Get in Touch</h2>
        <InfoItem title="📍 Our Office" content="Purdue University, Fort Wayne" />
        <InfoItem title="📞 Customer Care" content="+1 (260) 123-4567" />
        <InfoItem title="✉️ Email Support" content="support@pfw.edu" />
        <div className="info-item">
          <img
            src="assets/images/mastodon.png"
            alt="Mastodon Mascot"
            className="contact-img"
          />
          <p>
            Got a question or ran into a bump on your ride? 🚘 Don’t worry —
            we’ve got your back! Whether it’s payments, lost items, or just some
            feedback, drop us a message below and our team will get you moving
            again in no time. 💬✨
          </p>
        </div>
      </aside>
    </main>
  );
}

// 🧩 Sub-components to reduce complexity

function FormField({ label, id, type = "text", required = false }) {
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input type={type} id={id} name={id} required={required} />
    </>
  );
}

function SelectField({ label, id, options, required = false }) {
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <select id={id} name={id} required={required}>
        <option value="">-- Select --</option>
        {options.map((opt) => (
          <option key={opt} value={opt.toLowerCase().replace(" ", "-")}>
            {opt}
          </option>
        ))}
      </select>
    </>
  );
}

function InfoItem({ title, content }) {
  return (
    <div className="info-item">
      <strong>{title}</strong>
      <p>{content}</p>
    </div>
  );
}