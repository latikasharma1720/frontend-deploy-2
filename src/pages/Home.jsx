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
            <div className="hero-gallery">
              <figure className="gallery-card animate-on-scroll" style={{ "--delay": "0.1s" }}>
                <img src="/assets/home/ride1.jpeg" alt="Friendly pickup" />
              </figure>
              <figure className="gallery-card animate-on-scroll" style={{ "--delay": "0.2s" }}>
                <img src="/assets/home/ride2.jpeg" alt="Student ride" />
              </figure>
              <figure className="gallery-card animate-on-scroll" style={{ "--delay": "0.3s" }}>
                <img src="/assets/home/ride3.jpeg" alt="Safe drop-off" />
              </figure>
            </div>

            <h1 className="welcome-message animate-on-scroll" style={{ "--delay": "0.4s" }}>
              Welcome - for saving more on rides in Fort Wayne!
              <br />
              Exclusive to PFW students.
            </h1>

            <Link to="/signup" className="join-btn animate-on-scroll" style={{ "--delay": "0.5s" }}>
              Join for Free
            </Link>
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
                <img src="/assets/home/safety2.png" alt="Student using safety features" loading="lazy" />
              </div>

              <div className="content-text animate-on-scroll" style={{ "--delay": "0.2s" }}>
                <h2 id="safetyTitle">Safety, simplified</h2>
                <p>
                  Turn on and schedule your safety preferences—like sharing trip status and arrival reminders—right
                  from the MastoRide app.
                </p>
                <div className="content-actions">
                  <Link to="/about" className="btn-dark">Learn more</Link>
                  <Link to="/pricing" className="btn-outline">See prices</Link>
                </div>
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
                <video
                  className="afford-video"
                  src="/assets/home/affordable3.mp4"
                  poster="/assets/home/safety2.png"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                >
                  <source src="/assets/home/affordable3.mp4" type="video/mp4" />
                </video>
              </div>

              <div className="content-text animate-on-scroll" style={{ "--delay": "0.2s" }}>
                <h2 id="affordTitle">Affordable Rides, Anytime</h2>
                <p>
                  MastoRide connects you with verified drivers at budget-friendly rates, offering discounts for daily
                  commuters and group rides. Ride more, spend less.
                </p>
                <div className="content-actions">
                  <Link to="/pricing" className="btn-dark">View Plans</Link>
                  <Link to="/pricing#compare" className="btn-outline">Compare Rates</Link>
                </div>
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