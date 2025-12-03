// src/pages/Home.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";

export default function Home() {
  const [showBackButton, setShowBackButton] = useState(false);
  const backButtonRef = useRef(null);

  // Animate-in utility
  useEffect(() => {
    const animator = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("animate-in");
        });
      },
      { threshold: 0.6 }
    );
    document
      .querySelectorAll(".animate-on-scroll, .fullpage-section")
      .forEach((el) => animator.observe(el));
    return () => animator.disconnect();
  }, []);

  // Show ✕ ONLY on Safety or Affordable
  useEffect(() => {
    const safety = document.querySelector(".home-safety");
    const affordable = document.querySelector(".home-affordable");
    if (!safety || !affordable) return;

    const vis = new Map([
      [safety, false],
      [affordable, false],
    ]);

    const recompute = () => {
      setShowBackButton(Boolean(vis.get(safety) || vis.get(affordable)));
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          vis.set(e.target, e.isIntersecting && e.intersectionRatio >= 0.3);
        });
        recompute();
      },
      {
        threshold: [0, 0.3, 1],
        rootMargin: "-10% 0px -10% 0px",
      }
    );

    io.observe(safety);
    io.observe(affordable);

    const onResize = () => recompute();
    window.addEventListener("resize", onResize);

    return () => {
      io.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Scroll helpers
  const scrollToHero = () =>
    document.querySelector(".hero-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  const scrollToSafety = () =>
    document.querySelector(".home-safety")?.scrollIntoView({ behavior: "smooth", block: "start" });
  const scrollToAffordable = () =>
    document.querySelector(".home-affordable")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="modern-home-page">
      {/* Back (X) button */}
      <button
        ref={backButtonRef}
        className={`back-to-top-btn ${showBackButton ? "show" : ""}`}
        onClick={scrollToHero}
        aria-label="Back to top"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <main className="home-fullpage">
        {/* ---------- Hero Section ---------- */}
        <section className="fullpage-section hero-section">
          <div className="hero-content-center">
            

            <h1 className="welcome-message animate-on-scroll" style={{ "--delay": "0.4s" }}>
              About MastoRide
              
            </h1>

            <h2>Making everyday travel smarter, safer, and sustainable.</h2>
            <p>MastoRide was created with one simple belief — that commuting shouldn’t be stressful, unsafe, or expensive. <br/>We combine technology, community, and care to turn everyday rides into smooth, meaningful journeys.</p>

          </div>

          <button
            className="scroll-indicator animate-on-scroll"
            style={{ "--delay": "0.6s" }}
            onClick={scrollToSafety}
            aria-label="Scroll to Safety"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </section>

        {/* ---------- Safety Section ---------- */}
        <section className="fullpage-section home-safety" aria-labelledby="safetyTitle">
          <div className="section-content-center">
            <div className="content-grid">
              <div className="content-visual animate-on-scroll" style={{ "--delay": "0s" }}>
                <img src="/assets/home/mission.png" alt="Our Mission" loading="lazy" />
              </div>

              <div className="content-text animate-on-scroll" style={{ "--delay": "0.2s" }}>
                <h2 id="safetyTitle">Our Mission</h2>
                <p>
                  At MastoRide, our mission is to reshape how people move.
                </p>
                <p>We aim to make shared mobility accessible to everyone safe, affordable, and eco-friendly. Every ride you take helps reduce traffic, emissions, and costs while building a connected community of trusted riders and drivers.</p>
                
              </div>
            </div>
          </div>

          <button
            className="scroll-indicator animate-on-scroll"
            style={{ "--delay": "0.4s" }}
            onClick={scrollToAffordable}
            aria-label="Scroll to Affordable"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </section>

        {/* ---------- Affordable Section ---------- */}
        <section className="fullpage-section home-affordable" aria-labelledby="affordTitle">
          <div className="section-content-center">
            <div className="content-grid">
              <div className="content-visual animate-on-scroll" style={{ "--delay": "0s" }}>
                <img src="/assets/home/story.png" alt="Our Story" loading="lazy" />
              </div>

              <div className="content-text animate-on-scroll" style={{ "--delay": "0.2s" }}>
                <h2 id="affordTitle">Our Story</h2>
                <p>
                  What began as a small student project quickly grew into a vision for smarter urban travel.<br/>
Tired of unpredictable commutes, our founders built a platform that connects verified users for shared, reliable rides. From university campuses to city streets, MastoRide is now helping thousands reach their destinations efficiently and safely.
                </p>
                
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Footer ---------- */}
        <section className="fullpage-section home-footer" aria-label="Footer">
          <div className="footer-wrap">
            <Footer />
          </div>
        </section>
      </main>
    </div>
  );
}