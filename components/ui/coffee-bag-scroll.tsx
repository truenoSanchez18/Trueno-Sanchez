
"use client";
import React, { useRef, useEffect, useState } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

export const CoffeeBagScroll = ({
  titleComponent,
  imageSrc,
}: {
  titleComponent: React.ReactNode;
  imageSrc: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleValues = isMobile ? [0.75, 0.95] : [1.05, 1.0];
  
  const rotateX = useTransform(scrollYProgress, [0, 0.5], [22, 0]);
  const rotateY = useTransform(scrollYProgress, [0, 0.5], [-8, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], scaleValues);
  const translateY = useTransform(scrollYProgress, [0, 0.5], [0, -120]);
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.8, 1], [0, 1, 1, 0]);

  return (
    <div
      className="h-[60rem] md:h-[80rem] flex flex-col items-center justify-center relative px-4"
      ref={containerRef}
    >
      <div className="w-full max-w-5xl mx-auto text-center mb-12">
        {titleComponent}
      </div>

      <div
        className="relative w-full flex items-center justify-center"
        style={{ perspective: "1200px" }}
      >
        {/* Subtle gold halo behind the bag */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full bg-[#C9A24D]/20 blur-[100px] pointer-events-none" />

        <motion.div
          style={{
            rotateX,
            rotateY,
            scale,
            translateY,
            opacity,
          }}
          className="relative z-10 w-full flex justify-center"
        >
          <img
            src={imageSrc}
            alt="Origen Café Premium Bag"
            className="w-full max-w-[320px] md:max-w-[520px] h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] filter contrast-[1.05]"
          />
          
          {/* Subtle gold rim light effect simulated with a faint overlay if needed, 
              but usually high-quality assets handle this. Adding a soft internal glow. */}
          <div className="absolute inset-0 pointer-events-none rounded-full bg-gradient-to-b from-[#C9A24D]/5 to-transparent opacity-30" />
        </motion.div>
      </div>
    </div>
  );
};
