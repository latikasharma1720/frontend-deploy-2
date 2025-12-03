import React from "react";
import { useNavigate } from "react-router-dom";

export default function Pricing() {
  const navigate = useNavigate();
  const plans = [
    {
      name: "Economy",
      price: "$5",
      period: "base fare + $1.50 per mile",
      capacity: "1-4 passengers",
      features: [
        "Campus to nearby destinations",
        "Available 8 AM – 10 PM",
        "Verified student drivers",
        "Chat support",
      ],
      button: "Choose Economy",
      premium: false,
    },
    {
      name: "Premium",
      price: "$8",
      period: "base fare + $2.00 per mile",
      capacity: "1-4 passengers",
      features: [
        "Luxury vehicles",
        "Priority booking",
        "Exclusive weekend offers",
        "24/7 support",
      ],
      button: "Go Premium",
      premium: true,
    },
    {
      name: "XL Group",
      price: "$10",
      period: "base fare + $2.50 per mile",
      capacity: "5-8 passengers",
      features: [
        "Large vehicles for groups",
        "Perfect for events",
        "Extra luggage space",
        "Student group rates",
      ],
      button: "Book XL",
      premium: false,
    },
  ];

  return (
    <div className="pricing-section">
      <h1 className="welcome">Our Pricing Plans</h1>
      <p className="intro">Simple, transparent pricing made just for students.</p>
      
      <div className="pricing-info" style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <p>Fares are calculated based on distance and time. Student discount available with valid @pfw.edu or @purdue.edu email.</p>
        <p><strong>Example Routes:</strong> Campus to Airport (~$25), Campus to Downtown (~$15), Campus to Mall (~$12)</p>
      </div>

      <div className="pricing-grid">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`pricing-card ${plan.premium ? "premium" : ""}`}
          >
            <h2>{plan.name}</h2>
            <p className="capacity" style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
              Capacity: {plan.capacity}
            </p>
            <p className="price">
              {plan.price} <span>{plan.period}</span>
            </p>
            <ul>
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <button onClick={() => navigate('/user/dashboard')}>{plan.button}</button>
          </div>
        ))}
      </div>
      
      <div className="fare-calculator-info" style={{ marginTop: '3rem', textAlign: 'center', padding: '2rem', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
        <h3>How Fares Are Calculated</h3>
        <p>Base fare starting from $5 + Distance (per mile) + Time (per minute)</p>
        <p>Factors affecting price: distance, time, traffic, surge demand during peak hours</p>
        <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem' }}>
          No hidden fees or charges. Final price total includes all applicable fees. We accept credit card, debit card, and digital wallet payments.
        </p>
        <button 
          onClick={() => navigate('/user/dashboard')}
          className="pricing-card button"
          style={{ marginTop: '1rem', width: 'auto', padding: '12px 32px', fontSize: '1.1rem' }}
        >
          Book Now & Estimate Your Fare
        </button>
      </div>

      <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Pricing Transparency</h3>
        <p style={{ textAlign: 'center' }}>All pricing includes applicable taxes and fees. No hidden charges or surprise costs.</p>
        <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h4>Payment Methods</h4>
            <p>We accept credit cards, debit cards, and digital wallets for your convenience.</p>
          </div>
          <div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h4>Student Special</h4>
            <p>Save up to 20% with your verified university email (@pfw.edu or @purdue.edu)</p>
          </div>
          <div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <h4>Compare Options</h4>
            <p>Review the difference between Economy vs Premium vs XL to find your best value</p>
          </div>
        </div>
      </div>
    </div>
  );
}