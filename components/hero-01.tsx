"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { GradientMesh } from "@/components/gradient-mesh";
import { Button } from "@/components/ui/button";

export function HeroSection01() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* GradientWave behind the text */}
      <GradientMesh />

      <motion.div
        animate={{ opacity: 1 }}
        className="relative z-10 flex flex-col items-center text-center"
        initial={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Image
            alt="Logo"
            className="h-12 w-12 object-contain md:h-16 md:w-16"
            height={60}
            src="/ai-logo.png"
            width={60}
          />
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 font-extrabold text-6xl tracking-tighter md:text-7xl lg:text-9xl"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className="block bg-linear-to-b from-black via-black/90 to-black/80 bg-clip-text text-transparent mix-blend-overlay dark:from-white dark:via-white/90 dark:to-white/80">
            Design
          </span>
          <span className="block bg-linear-to-b from-black via-black/90 to-black/80 bg-clip-text text-transparent mix-blend-overlay dark:from-white dark:via-white/90 dark:to-white/80">
            without Limits
          </span>
        </motion.h1>

        {/* Content Section */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="flex max-w-2xl flex-col items-center space-y-8 px-6"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="font-light text-base text-black/80 leading-relaxed mix-blend-overlay md:text-xl dark:text-white/80">
            I create digital experiences that connect and inspire. I build apps, websites, brands,
            and products end-to-end.
          </p>

          {/* CTA Buttons */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link href="https://cal.com/aliimam-in/30min" target="_blank">
              <Button
                className="h-12 rounded-full px-8 shadow-lg transition-all hover:scale-105 hover:shadow-xl md:h-14 md:px-10"
                size="lg"
              >
                Book an Intro Call
              </Button>
            </Link>
            <Button
              className="h-12 rounded-full px-8 transition-all hover:scale-105 md:h-14 md:px-10"
              size="lg"
              variant="secondary"
            >
              Explore Work
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
