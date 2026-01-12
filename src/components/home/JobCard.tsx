'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

interface JobCardProps {
    company: string;
    position: string;
    logo: string;
    description: string;
    }

export default function JobCard({ company, position, logo, description }: JobCardProps) {
    return (
        <motion.div 
        whileHover={{ y: -5 }}
        className="min-w-[280px] bg-[#25262B] border border-white/5 rounded-2xl p-6 cursor-pointer hover:bg-[#2C2D33] transition-colors"
        >
        <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white rounded-xl overflow-hidden flex items-center justify-center p-2">
            <img src={logo} alt={company} className="object-contain" />
            </div>
            <div>
            <h4 className="text-white font-bold">{company}</h4>
            <p className="text-gray-400 text-sm">{position}</p>
            </div>
        </div>
        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
            {description}
        </p>
        </motion.div>
    );
}