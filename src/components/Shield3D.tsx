"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { Shield, Zap, Lock, FileText } from "lucide-react";

export function Shield3D() {
    const ref = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Mouse position state (normalized -0.5 to 0.5)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        // Calculate raw relative position
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Normalize between -0.5 and 0.5
        setMousePosition({
            x: (x / rect.width) - 0.5,
            y: (y / rect.height) - 0.5,
        });
    };

    // Smooth physics springs
    const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };
    const springX = useSpring(0, springConfig);
    const springY = useSpring(0, springConfig);

    useEffect(() => {
        if (isHovered) {
            springX.set(mousePosition.x);
            springY.set(mousePosition.y);
        } else {
            springX.set(0);
            springY.set(0);
        }
    }, [mousePosition, isHovered, springX, springY]);

    // Transform mouse coordinates into 3D rotations
    // Rotating around X axis means tilting up/down (based on Y mouse)
    // Rotating around Y axis means tilting left/right (based on X mouse)
    const rotateX = useTransform(springY, [-0.5, 0.5], [25, -25]);
    const rotateY = useTransform(springX, [-0.5, 0.5], [-25, 25]);

    return (
        <div
            ref={ref}
            className="relative mx-auto flex h-64 w-64 items-center justify-center sm:h-80 sm:w-80"
            style={{ perspective: '1200px' }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-[100px] transition-opacity duration-500" style={{ opacity: isHovered ? 0.8 : 0.4 }} />

            <motion.div
                className="relative z-10 flex h-full w-full items-center justify-center cursor-pointer"
                style={{
                    rotateX: isHovered ? rotateX : 0,
                    rotateY: isHovered ? rotateY : 0,
                    transformStyle: "preserve-3d",
                }}
                animate={!isHovered ? {
                    rotateY: [0, 5, -5, 0],
                    rotateX: [0, -2, 2, 0],
                    y: [-5, 5, -5]
                } : { y: 0 }}
                transition={!isHovered ? {
                    duration: 6,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                } : { duration: 0.2 }}
            >
                {/* The glowing shield core */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Shield className="h-4/5 w-4/5 text-indigo-500/40 drop-shadow-[0_0_25px_rgba(99,102,241,0.6)]" strokeWidth={1} style={{ transform: "translateZ(-30px)" }} />
                </div>

                {/* Main Solid Glass Shield */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div
                        className="flex h-full w-full items-center justify-center rounded-3xl border border-white/10 bg-black/20 backdrop-blur-xl shadow-2xl overflow-hidden relative"
                        style={{ transform: "translateZ(0px)", clipPath: "polygon(50% 0%, 100% 20%, 100% 70%, 50% 100%, 0% 70%, 0% 20%)" }}
                    >
                        <Shield className="h-full w-full text-indigo-500 hidden" />

                        {/* Shimmer effect inside the glass shield */}
                        <motion.div
                            className="absolute inset-0 w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white/5 to-transparent"
                            style={{ top: '-50%', left: '-50%' }}
                            animate={{ x: ['-20%', '120%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        />

                        {/* Centered Large SVG Icon */}
                        <Shield className="h-24 w-24 text-white drop-shadow-md z-10" strokeWidth={1.5} />
                    </div>
                </div>

                {/* Floating Elements popping OUT in 3D */}
                <motion.div
                    className="absolute -right-6 -top-2 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                    style={{ transform: "translateZ(60px)" }}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                >
                    <Zap className="h-6 w-6 text-indigo-400" />
                </motion.div>

                <motion.div
                    className="absolute -bottom-4 -left-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                    style={{ transform: "translateZ(80px)" }}
                    animate={{ y: [0, 12, 0] }}
                    transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                >
                    <Lock className="h-7 w-7 text-emerald-400" />
                </motion.div>

                <motion.div
                    className="absolute -right-8 bottom-12 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                    style={{ transform: "translateZ(50px)" }}
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, delay: 2 }}
                >
                    <FileText className="h-5 w-5 text-blue-400 border border-blue-400/20 rounded ml-1 bg-blue-400/10 p-0.5" />
                </motion.div>
            </motion.div>
        </div>
    );
}
