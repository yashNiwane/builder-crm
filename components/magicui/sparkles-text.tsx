"use client";

import { CSSProperties, ReactElement, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Sparkle {
  id: string;
  x: string;
  y: string;
  color: string;
  delay: number;
  scale: number;
  lifespan: number;
}

interface SparklesTextProps {
  text: string;
  colors?: { first: string; second: string };
  className?: string;
  sparklesCount?: number;
  as?: React.ElementType;
}

const generateSparkle = (color: string): Sparkle => {
  return {
    id: String(Math.random() * 99999),
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    color,
    delay: Math.random() * 2,
    scale: Math.random() * 0.5 + 0.5,
    lifespan: Math.random() * 1 + 1,
  };
};

export const SparklesText = ({
  text,
  colors = { first: "#9E7AFF", second: "#FE8BBB" },
  className,
  sparklesCount = 10,
  as: Component = "span",
}: SparklesTextProps) => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    setSparkles(
      Array.from({ length: sparklesCount }).map((_, i) =>
        generateSparkle(i % 2 === 0 ? colors.first : colors.second)
      )
    );
  }, [sparklesCount, colors.first, colors.second]);

  return (
    <Component className={cn("inline-block relative text-black dark:text-white", className)}>
      {text}
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="pointer-events-none absolute"
          style={{ left: sparkle.x, top: sparkle.y }}
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, sparkle.scale, 0],
            rotate: [0, 90, 180],
          }}
          transition={{
            duration: sparkle.lifespan,
            repeat: Infinity,
            delay: sparkle.delay,
            ease: "easeInOut",
          }}
        >
          <svg className="w-4 h-4" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M26.5 25.5C19.0043 33.3697 0 34 0 34C0 34 19.1013 35.3684 26.5 43.5C33.234 50.901 34 68 34 68C34 68 36.9884 50.7065 44.5 43.5C51.6431 36.647 68 34 68 34C68 34 51.6947 32.0939 44.5 25.5C36.5605 18.2235 34 0 34 0C34 0 33.6591 17.9837 26.5 25.5Z"
              fill={sparkle.color}
            />
          </svg>
        </motion.div>
      ))}
    </Component>
  );
};
