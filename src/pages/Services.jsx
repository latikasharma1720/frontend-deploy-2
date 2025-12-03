// src/pages/Services.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Services() {
  const navigate = useNavigate();
  return (
    <div className="page-wrapper">
      <div className="services-header">
        <h1 className="welcome">Our Services</h1>
        <p className="intro">
          Affordable, safe, and reliable rides — built exclusively for Purdue
          University students. 🚗
        </p>
      </div>

      <div className="service-grid">
        <div className="service-card fade-in-up">
          <h3>🚖 Campus to Home</h3>
          <p>
            Quick and convenient rides from campus to your home or nearby
            destinations, available 24/7.
          </p>
        </div>
        <div className="service-card fade-in-up">
          <h3>🎓 Event Rides</h3>
          <p>
            Group rides to university events, sports matches, or meetups with
            verified PFW student drivers.
          </p>
        </div>
        <div className="service-card fade-in-up">
          <h3>🛍️ Errand Runs</h3>
          <p>
            Need to run errands or grab groceries? Get short-distance rides at
            affordable rates.
          </p>
        </div>
        <div className="service-card fade-in-up">
          <h3>🚌 Out-of-Town Trips</h3>
          <p>
            Heading out of the city? Enjoy safe long-distance travel with
            pre-scheduled, shared rides.
          </p>
        </div>
      </div>

      <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Vehicle Types & Service Options</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3>Economy</h3>
            <p>Affordable rides for everyday travel. Perfect for solo students or small groups. Starting at $5 base fare.</p>
          </div>
          <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3>Premium</h3>
            <p>Luxury vehicles with priority service. Enjoy a comfortable ride with enhanced features and amenities.</p>
          </div>
          <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3>XL Group</h3>
            <p>Large vehicles for groups of 5-8 passengers. Ideal for events, group outings, and shared trips.</p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Service Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <div>
            <h3>🕒 Operating Hours</h3>
            <p>Available 24/7 for your convenience. Book anytime, day or night.</p>
          </div>
          <div>
            <h3>💰 Pricing & Rates</h3>
            <p>Transparent pricing with no hidden fees. Check our <a href="/pricing" style={{ color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); navigate('/pricing'); }}>pricing page</a> for detailed rates and cost information.</p>
          </div>
          <div>
            <h3>🎓 Student Benefits</h3>
            <p>Special rates for students! Sign up or register with your university email to unlock exclusive discounts.</p>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '3rem', padding: '2rem' }}>
        <h2>Ready to Ride?</h2>
        <p style={{ marginBottom: '1.5rem' }}>Book your ride now and experience safe, affordable student transportation.</p>
        <a href="/user/dashboard" style={{ textDecoration: 'none' }}>
          <button 
            className="pricing-card button"
            onClick={() => navigate('/user/dashboard')}
            style={{ width: 'auto', padding: '12px 32px', fontSize: '1.1rem' }}
          >
            Book a Ride Now
          </button>
        </a>
      </div>
    </div>
  );
}