'use client';

import { motion } from 'framer-motion';
import { Calendar, Building, Briefcase } from 'lucide-react';

interface JobCardProps {
    id: number;
    company: string;
    position: string;
    logo?: string;
    deadline: string | null; // null 허용 (상시채용 대응)
    url: string;
}

export default function JobCard({ 
    id, 
    company, 
    position, 
    logo, 
    deadline, 
    url
}: JobCardProps) {
    
    // 마감일 배지 렌더링 로직
    const renderBadge = () => {
        if (!deadline) return null; // ✅ 마감일 없으면 배지 삭제

        const today = new Date();
        const deadlineDate = new Date(deadline);
        
        // 날짜 차이 계산 (시간 무시하고 날짜로만 비교하기 위해 setHours 처리 권장하지만, 간단히 diff로 처리)
        const diffTime = deadlineDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let dDayText = "";
        let dDayColor = "bg-gray-600"; // 기본 회색

        if (diffDays > 0) {
            dDayText = `D-${diffDays}`;
            if (diffDays <= 3) dDayColor = "bg-red-500/80"; // 임박 시 빨강
        } else if (diffDays === 0) {
            dDayText = "Today";
            dDayColor = "bg-red-500/80";
        } else {
            dDayText = "마감"; // ✅ 지났으면 '마감' 표시
            dDayColor = "bg-gray-700 text-gray-300"; // 마감된 건 조금 더 어둡게
        }

        return (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white flex-shrink-0 ${dDayColor}`}>
                {dDayText}
            </span>
        );
    };

    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className="relative w-full min-w-[280px] rounded-2xl p-6 cursor-pointer border transition-all duration-200 bg-[#25262B] border-white/5 hover:bg-[#2C2D33] hover:border-white/20"
        >

            {/* 카드 전체 링크 */}
            <a href={url} target="_blank" rel="noopener noreferrer" className="block">
                <div className="flex items-center gap-4 mb-4">
                    {/* 로고 영역 */}
                    <div className="w-12 h-12 bg-white rounded-xl overflow-hidden flex items-center justify-center p-2 flex-shrink-0">
                        {logo ? (
                            <img src={logo} alt={company} className="object-contain w-full h-full" />
                        ) : (
                            <Building className="text-gray-400" />
                        )}
                    </div>
                    
                    {/* 텍스트 정보 */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-bold truncate">{company}</h4>
                            {/* 배지 표시 (마감일 없으면 안 뜸) */}
                            {renderBadge()}
                        </div>
                        <p className="text-gray-400 text-sm truncate">{position}</p>
                    </div>
                </div>

                {/* 하단 정보 */}
                <div className="flex items-center gap-3 text-xs text-gray-500 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        {/* 마감일이 있으면 날짜, 없으면 상시채용 */}
                        <span>{deadline || "상시채용"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Briefcase size={12} />
                        <span>채용중</span>
                    </div>
                </div>
            </a>
        </motion.div>
    );
}