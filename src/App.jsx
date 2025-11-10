import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./index.css";

const images = [
  "/muur.png",
  "/MUUR 1.png",
  "/MUUR 2.png",
  "/MUUR 3.png",
  "/MUUR 4.png",
  "/MUUR 5.png",
  "/MUUR 6.png",
];

const MAX_CLICKS = 500; 
const BACKEND = "https://muur-backend.onrender.com";

export default function App() {
  const [clicks, setClicks] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [dust, setDust] = useState(false);
  const [dailyClicked, setDailyClicked] = useState(false);

  useEffect(() => {
    fetch(`${BACKEND}/clicks`)
      .then((res) => res.json())
      .then((data) => setClicks(data.clicks || 0))
      .catch(() => {});

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
      const res = await fetch(`${BACKEND}/click`, { method: "POST" });
      const data = await res.json();
      setClicks(data.clicks);
    } catch {
      setClicks((c) => Math.min(c + 1, MAX_CLICKS));
    }
  };

  const stage =
    clicks === 0
      ? 0
      : Math.min(
          Math.floor((clicks / MAX_CLICKS) * (images.length - 1)),
          images.length - 1
        );

  const wallImage = images[stage];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4 text-center overflow-hidden">

      <h1 className="text-4xl sm:text-5xl font-bold mb-2 text-black">
        💥 Break the Wall! 
      </h1>

      <p className="mb-4 text-lg text-gray-700">
        Smash it together — 1 punch per day.
      </p>

      <div className="relative w-full max-w-[600px] flex justify-center">
        <motion.img
          key={stage}
          src={wallImage}
          alt="Wall"
          onClick={handleClick}
          className={`w-full h-auto rounded-xl shadow-lg cursor-pointer object-contain ${
            animating ? "animate-shake" : ""
          }`}
        />

        <AnimatePresence>
          {dust && (
            <motion.div
              className="absolute top-1/2 left-1/2 w-48 h-48 bg-gray-400 opacity-30 rounded-full blur-3xl pointer-events-none"
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          )}
        </AnimatePresence>
      </div>

      <div className="mt-5 text-center">
        {clicks < MAX_CLICKS && !dailyClicked && (
          <p className="text-lg text-gray-700">
            Click the wall once per day to help break it!
          </p>
        )}

        {clicks < MAX_CLICKS && dailyClicked && (
          <p className="text-red-600 text-lg font-semibold">
            👊 Daily punch used — see you tomorrow warrior!
          </p>
        )}
      </div>
    </div>
  );
}
