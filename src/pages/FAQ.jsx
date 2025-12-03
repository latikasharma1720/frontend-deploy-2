import React, { useState } from "react";

export default function FAQ() {
  const faqs = [
    {
      question: "What is your return policy?",
      answer:
        "We offer a 30-day money-back guarantee on all purchases. Items must be unused and in original packaging.",
    },
    {
      question: "Do you provide international shipping?",
      answer:
        "Yes! We ship worldwide. Delivery times vary by region and shipping option.",
    },
    {
      question: "How can I contact support?",
      answer:
        "You can reach our support team anytime via email at support@example.com.",
    },
  ];

  return (
    <section className="faq-section">
      <h2 className="faq-title">Frequently Asked Questions</h2>
      {faqs.map((faq, index) => (
        <FAQItem key={index} question={faq.question} answer={faq.answer} />
      ))}

      {/* Inline styling so you don't need a separate CSS file */}
      <style jsx>{`
        .faq-section {
          max-width: 700px;
          margin: 3rem auto;
          padding: 0 1rem;
          font-family: system-ui, sans-serif;
        }

        .faq-title {
          text-align: center;
          font-size: 2rem;
          font-weight: 600;
          margin-bottom: 2rem;
        }

        .faq-item {
          border-bottom: 1px solid #ddd;
          margin-bottom: 1rem;
          overflow: hidden;
        }

        .faq-question {
          width: 100%;
          background: none;
          border: none;
          text-align: left;
          font-size: 1.1rem;
          font-weight: 500;
          padding: 1rem;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background 0.2s ease;
        }

        .faq-question:hover {
          background: #f9f9f9;
        }

        .faq-icon {
          font-size: 1.5rem;
          transition: transform 0.3s ease;
        }

        .faq-answer {
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          padding: 0 1rem;
          transition: all 0.3s ease;
        }

        .faq-item.active .faq-answer {
          max-height: 200px;
          opacity: 1;
          padding: 0 1rem 1rem;
        }

        .faq-item.active .faq-icon {
          transform: rotate(0deg);
        }
      `}</style>
    </section>
  );
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`faq-item ${open ? "active" : ""}`}>
      <button
        className="faq-question"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {question}
        <span className="faq-icon">{open ? "–" : "+"}</span>
      </button>
      <div className="faq-answer">
        <p>{answer}</p>
      </div>
    </div>
  );
}
