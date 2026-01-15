'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 데이터셋 (동일함)
const ALL_TOP_5_DATA = [
    // Front
    { id: 1, rank: 1, name: 'React', category: '웹 프레임워크', type: 'Front', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg' },
    { id: 2, rank: 2, name: 'Next.js', category: '웹 프레임워크', type: 'Front', logo: 'https://cdn.worldvectorlogo.com/logos/next-js.svg' },
    { id: 3, rank: 3, name: 'Vue.js', category: '웹 프레임워크', type: 'Front', logo: 'https://vuejs.org/images/logo.png' },
    { id: 4, rank: 4, name: 'TypeScript', category: '프로그래밍 언어', type: 'Front', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg' },
    { id: 5, rank: 5, name: 'Tailwind CSS', category: 'CSS 프레임워크', type: 'Front', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg' },
    
    // Back
    { id: 6, rank: 1, name: 'Spring Boot', category: '백엔드 프레임워크', type: 'Back', logo: 'https://spring.io/images/projects/spring-edf462fec682b9d74b53f6b70495876a.svg' },
    { id: 7, rank: 2, name: 'Node.js', category: '런타임 환경', type: 'Back', logo: 'https://nodejs.org/static/images/logo.svg' },
    { id: 8, rank: 3, name: 'Go', category: '프로그래밍 언어', type: 'Back', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Go_Logo_Blue.svg' },
    { id: 9, rank: 4, name: 'PostgreSQL', category: '데이터베이스', type: 'Back', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Postgresql_elephant.svg' },
    { id: 10, rank: 5, name: 'NestJS', category: 'Node.js 프레임워크', type: 'Back', logo: 'https://raw.githubusercontent.com/nestjs/nest/master/sample/01-cats-app/src/assets/logo-small.svg' },

    // AI & Data
    { id: 11, rank: 1, name: 'PyTorch', category: '머신러닝 라이브러리', type: 'AI & Data', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/10/PyTorch_logo.svg' },
    { id: 12, rank: 2, name: 'TensorFlow', category: '머신러닝 플랫폼', type: 'AI & Data', logo: 'https://www.gstatic.com/devrel-devsite/prod/v608c0059c47c0b064c575a7c2e0b6df42d721a9a8344e13e8677c77f0c1c8770/tensorflow/images/lockup.svg' },
    { id: 13, rank: 3, name: 'Pandas', category: '데이터 분석 라이브러리', type: 'AI & Data', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Pandas_logo.svg' },
    { id: 14, rank: 4, name: 'Scikit-learn', category: '머신러닝 라이브러리', type: 'AI & Data', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Scikit_learn_logo_small.svg' },
    { id: 15, rank: 5, name: 'Apache Spark', category: '데이터 처리 엔진', type: 'AI & Data', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Apache_Spark_logo.svg' },

    // DevOps
    { id: 16, rank: 1, name: 'Docker', category: '컨테이너화 플랫폼', type: 'DevOps', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Docker_Logo.png' },
    { id: 17, rank: 2, name: 'Kubernetes', category: '오케스트레이션', type: 'DevOps', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Kubernetes_logo_without_workmark.svg' },
    { id: 18, rank: 3, name: 'Terraform', category: 'IaC 도구', type: 'DevOps', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Terraform_Logo.svg' },
    { id: 19, rank: 4, name: 'AWS', category: '클라우드 컴퓨팅', type: 'DevOps', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg' },
    { id: 20, rank: 5, name: 'Jenkins', category: 'CI/CD 도구', type: 'DevOps', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Jenkins_logo.svg' },

    // Embeding
    { id: 21, rank: 1, name: 'C++', category: '시스템 프로그래밍', type: 'Embeding', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/18/ISO_C%2B%2B_Logo.svg' },
    { id: 22, rank: 2, name: 'Rust', category: '시스템 프로그래밍', type: 'Embeding', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Rust_programming_language_black_logo.svg' },
    { id: 23, rank: 3, name: 'Arduino', category: '하드웨어 플랫폼', type: 'Embeding', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Arduino_Logo.svg' },
    { id: 24, rank: 4, name: 'Raspberry Pi', category: '싱글 보드 컴퓨터', type: 'Embeding', logo: 'https://upload.wikimedia.org/wikipedia/ko/c/cb/Raspberry_Pi_Logo.svg' },
    { id: 25, rank: 5, name: 'FreeRTOS', category: 'RTOS', type: 'Embeding', logo: 'https://www.freertos.org/fr-content-src/uploads/2021/07/FreeRTOS_logo.png' },

    // Game
    { id: 26, rank: 1, name: 'Unity', category: '게임 엔진', type: 'Game', logo: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Unity_Technologies_logo.svg' },
    { id: 27, rank: 2, name: 'Unreal Engine', category: '게임 엔진', type: 'Game', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Unreal_Engine_logo.svg' },
    { id: 28, rank: 3, name: 'Godot', category: '오픈소스 엔진', type: 'Game', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Godot_icon.svg' },
    { id: 29, rank: 4, name: 'C#', category: '프로그래밍 언어', type: 'Game', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Csharp_Logo.png' },
    { id: 30, rank: 5, name: 'OpenGL', category: '그래픽 API', type: 'Game', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/OpenGL_logo.svg' },

    // Security
    { id: 31, rank: 1, name: 'Kali Linux', category: '침투 테스트 OS', type: 'Security', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/Kali-linux-logo.svg' },
    { id: 32, rank: 2, name: 'Wireshark', category: '네트워크 분석', type: 'Security', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Wireshark_icon.svg' },
    { id: 33, rank: 3, name: 'Metasploit', category: '취약점 진단 도구', type: 'Security', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Metasploit_logo.png' },
    { id: 34, rank: 4, name: 'Burp Suite', category: '웹 보안 도구', type: 'Security', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Burp_Suite_logo.png' },
    { id: 35, rank: 5, name: 'Snort', category: 'IDS/IPS', type: 'Security', logo: 'https://www.snort.org/assets/snort_logo-4e785501cd612cf88812c5b36417d472.png' },
];

const CATEGORIES = ['Front', 'Back', 'AI & Data', 'DevOps', 'Embeding', 'Game', 'Security'];

export default function Top5Section() {
    const [selectedCategory, setSelectedCategory] = useState('Front');
    const scrollRef = useRef<HTMLDivElement>(null);
    const isDown = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    // 드래그 로직
    const handleMouseDown = (e: React.MouseEvent) => {
        isDown.current = true;
        if (scrollRef.current) {
            scrollRef.current.classList.add('cursor-grabbing');
            startX.current = e.pageX - scrollRef.current.offsetLeft;
            scrollLeft.current = scrollRef.current.scrollLeft;
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDown.current || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX.current) * 2;
        scrollRef.current.scrollLeft = scrollLeft.current - walk;
    };

    const handleMouseUp = () => {
        isDown.current = false;
        scrollRef.current?.classList.remove('cursor-grabbing');
    };

    const filteredData = ALL_TOP_5_DATA.filter(item => item.type === selectedCategory);

    return (
        <div className="border border-[#9FA0A8]/30 rounded-[20px] p-8 bg-[#1A1B1E] w-full shadow-2xl z-10 lg:sticky lg:top-[86px]">
            <div className="flex items-center gap-4 mb-6">
                <span className="text-2xl font-bold">🔥</span>
                <h3 className="text-white text-xl font-bold uppercase tracking-tight">요즘 뜨는 Top 5</h3>
            </div>

            {/* 카테고리 탭 */}
            <div 
                ref={scrollRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="flex gap-3 mb-8 overflow-x-auto no-scrollbar pb-3 cursor-grab select-none"
            >
                {CATEGORIES.map((tab) => (
                    <button 
                        key={tab} 
                        onClick={() => setSelectedCategory(tab)}
                        className={`px-4 py-2 border rounded-full text-base transition-all shrink-0 ${
                        selectedCategory === tab 
                            ? 'bg-[#1C89AD] border-[#1C89AD] text-white font-medium shadow-lg shadow-[#1C89AD]/20'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* 애니메이션 리스트 구역 */}
            <div className="relative min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={selectedCategory} // 카테고리 변경 시 애니메이션 트리거
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="flex flex-col gap-6"
                    >
                        {filteredData.map((item, index) => (
                            <motion.div 
                                key={item.id} 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }} // 아이템별 순차적 등장(Stagger)
                                className="flex items-center gap-6 group cursor-pointer"
                            >
                                <div className="w-14 h-14 bg-white rounded-xl overflow-hidden flex items-center justify-center p-3 shrink-0 group-hover:scale-105 transition-transform shadow-md">
                                    <img src={item.logo} alt={item.name} className="object-contain w-full h-full" />
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[#9FA0A8] text-sm uppercase mb-1 font-semibold tracking-wider">
                                        {item.category}
                                    </p>
                                    <h4 className="text-white font-bold text-xl truncate leading-tight">
                                        {item.name}
                                    </h4>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}