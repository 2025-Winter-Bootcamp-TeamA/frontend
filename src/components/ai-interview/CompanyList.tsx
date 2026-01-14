'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Star } from 'lucide-react';

interface Props {
    companies: any[];
    selectedCompany: any;
    onSelect: (company: any) => void;
    onFavorite: (e: any, id: number) => void;
    }

export default function CompanyList({ companies, selectedCompany, onSelect, onFavorite }: Props) {
    return (
        <div className="bg-[#212226] border border-white/10 rounded-[32px] p-8 h-[600px] flex flex-col">
        <h3 className="text-white/40 text-[11px] font-bold uppercase mb-8 tracking-widest">추천 회사 리스트</h3>
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-3">
            {companies.map((company) => (
                <motion.div 
                layout key={company.id} 
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={() => onSelect(company)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group ${
                    selectedCompany?.id === company.id ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-white/5 border-white/5 hover:border-white/20'
                }`}
                >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-lg p-1.5 flex items-center justify-center">
                    <Building2 className="text-[#1A1B1E]" size={20} />
                    </div>
                    <div>
                    <p className="font-bold text-sm">{company.name}</p>
                    <p className="text-[10px] text-white/30">{company.category}</p>
                    </div>
                </div>
                <button onClick={(e) => onFavorite(e, company.id)} className="p-1 hover:scale-125 transition-transform">
                    <Star size={18} className={company.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-white/10 group-hover:text-white/30'} />
                </button>
                </motion.div>
            ))}
            </div>
        </div>
        </div>
    );
}