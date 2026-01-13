import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface DropdownProps {
    value: 'weekly' | 'monthly' | 'yearly';
    onChange: (val: 'weekly' | 'monthly' | 'yearly') => void;
    }

    const options = [
    { label: '주간', value: 'weekly' },
    { label: '월간', value: 'monthly' },
    { label: '연간', value: 'yearly' },
    ];

    export function TimeLineDropdown({ value, onChange }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 현재 선택된 라벨 찾기
    const currentLabel = options.find((opt) => opt.value === value)?.label;

    // 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
        {/* 선택된 값 표시 버튼 */}
        <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 bg-black/40 border border-white/10 hover:border-white/20 transition-all px-3 py-1.5 rounded-xl text-[11px] font-bold text-white/80"
        >
            {currentLabel}
            <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            >
            <ChevronDown size={14} className="text-white/40" />
            </motion.div>
        </button>

        {/* 드롭다운 메뉴 리스트 */}
        <AnimatePresence>
            {isOpen && (
            <motion.ul
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 5, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 z-50 min-w-[80px] bg-[#2A2B30] border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl"
            >
                {options.map((opt) => (
                <li key={opt.value}>
                    <button
                    onClick={() => {
                        onChange(opt.value as any);
                        setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-[11px] font-medium transition-colors
                        ${value === opt.value 
                        ? 'bg-blue-600 text-white' 
                        : 'text-white/60 hover:bg-white/5 hover:text-white'}
                    `}
                    >
                    {opt.label}
                    </button>
                </li>
                ))}
            </motion.ul>
            )}
        </AnimatePresence>
        </div>
    );
}