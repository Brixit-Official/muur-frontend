import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./index.css"; // houd je bestaande Tailwind/index styles

const images = [
  "/muur.png",
  "/MUUR 1.png",
  "/MUUR 2.png",
  "/MUUR 3.png",
  "/MUUR 4.png",
  "/MUUR 5.png",
  "/MUUR 6.png",
];

const MAX_CLICKS = 500; // <- aangepast naar 500

export default function App() {
  const [clicks, setClicks] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [dust, setDust] = useState(false);
  const [dailyClicked, setDailyClicked] = useState(false);

  useEffect(() => {
    // fetch shared counter from backend (if running)
    fetch("http://localhost:3001/clicks")
      .then((res) => res.json())
      .then((data) => setClicks(data.clicks || 0))
      .catch(() => {
        // backend niet bereikbaar => fallback: keep local clicks (do nothing)
      });

    const lastClick = localStorage.getItem("lastClickDate");
    const today = new Date().toDateString();
    if (lastClick === today) setDailyClicked(true);
  }, []);

  const handleClick = async () => {
    if (dailyClicked || clicks >= MAX_CLICKS) return;

    const today = new Date().toDateString();
    localStorage.setItem("lastClickDate", today);
    setDailyClicked(true);

    setAnimating(true);
    setDust(true);
    setTimeout(() => setAnimating(false), 250);
    setTimeout(() => setDust(false), 600);

    try {
      const res = await fetch("http://localhost:3001/click", { method: "POST" });
      const data = await res.json();
      setClicks(data.clicks);
    } catch (err) {
      // fallback: if backend fails, increment locally (optional)
      setClicks((c) => Math.min(c + 1, MAX_CLICKS));
      console.error("Backend click failed:", err);
    }
  };

  // ensure initial image is always images[0] when clicks === 0
  const stage = clicks === 0
    ? 0
    : Math.min(
        Math.floor((clicks / MAX_CLICKS) * (images.length - 1)),
        images.length - 1
      );

  const wallImage = images[stage];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-100 to-white px-4 text-center overflow-hidden">
      {/* Title (top, centered) */}
      <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-black">💥 Break the Wall! 💥</h1>

      {/* Subtitle above image */}
      <p className="mb-4 text-lg text-gray-700 max-w-xl">
        Click the wall once per day to help break it!
      </p>

      {/* Image container (centered) */}
      <div className="relative w-full max-w-2xl flex justify-center">
        <motion.img
          key={stage}
          src={wallImage}
          alt="Wall"
          onClick={handleClick}
          className={`w-full max-w-[90vw] sm:max-w-[700px] h-auto rounded-2xl shadow-lg cursor-pointer object-contain ${
            animating ? "animate-shake" : ""
          }`}
        />

        {/* Dust effect */}
        <AnimatePresence>
          {dust && (
            <motion.div
              className="absolute top-1/2 left-1/2 w-64 h-64 bg-gray-400 opacity-30 rounded-full blur-3xl pointer-events-none"
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Footer text (centered under image) */}
      <div className="mt-6 text-center text-gray-700 flex flex-col items-center">
        {!dailyClicked && clicks < MAX_CLICKS && (
          <p className="text-lg">Click the wall once per day to help break it!</p>
        )}
        {dailyClicked && clicks < MAX_CLICKS && (
          <p className="text-red-600 mt-2 italic">You can only punch once per day!</p>
        )}
        {clicks >= MAX_CLICKS && (
          <div className="mt-6 p-6 bg-gray-100 rounded-2xl shadow text-center max-w-lg">
            <h2 className="text-2xl font-bold mb-2">🎉 Congratulations! 🎉</h2>
            <p className="text-gray-700 mb-4">Thank you for helping us break the wall!</p>
            <input className="border border-gray-300 rounded px-3 py-2 mb-3 w-64" placeholder="Your Name" />
            <br />
            <input className="border border-gray-300 rounded px-3 py-2 mb-3 w-64" placeholder="Your Wallet Address" />
            <br />
            <button className="bg-black text-white px-5 py-2 rounded mt-2">Submit</button>
          </div>
        )}
      </div>
    </div>
  );
}
