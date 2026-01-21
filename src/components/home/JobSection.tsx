'use client';

import { useRouter } from 'next/navigation';
import JobCard from './JobCard';

const MOCK_JOBS = [
    { 
        id: 1, 
        company: '네이버', 
        position: 'Backend Developer (Search)', 
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Naver_Logotype.svg/800px-Naver_Logotype.svg.png', 
        description: '수억 건의 데이터를 처리하는 검색 엔진의 백엔드 시스템을 설계하고 최적화합니다.' 
    },
    { 
        id: 2, 
        company: '카카오', 
        position: 'Frontend Developer (Wallet)', 
        logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Kakao_Corp._logo.svg', 
        description: '사용자의 일상을 바꾸는 카카오톡 내 자산 관리 및 결제 서비스의 UI를 개발합니다.' 
    },
    { 
        id: 3, 
        company: '라인', 
        position: 'iOS Developer', 
        logo: 'https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg', 
        description: '전 세계 2억 명 이상의 유저가 사용하는 글로벌 메신저 LINE의 모바일 앱을 고도화합니다.' 
    },
    { 
        id: 4, 
        company: '쿠팡', 
        position: 'Data Engineer', 
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Coupang_logo.svg/800px-Coupang_logo.svg.png', 
        description: '로켓배송을 가능케 하는 물류 최적화 알고리즘을 위한 대규모 데이터 파이프라인을 구축합니다.' 
    },
     { 
        id: 5, 
        company: '토스', 
        position: 'Server Developer', 
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Toss_Logo_Primary.png/800px-Toss_Logo_Primary.png', 
        description: '금융의 모든 순간을 혁신하는 토스 서버를 개발합니다.' 
    },
];

export default function JobSection() {
    const router = useRouter();

    const handleMoreClick = () => {
        router.push('/map');
    };

    return (
        <section className="w-full h-full">
            <div className="w-full h-full rounded-[24px] lg:rounded-[32px] bg-[#25262B] border border-gray-800 p-6 flex flex-col">
                {/* 헤더 고정 */}
                <div className="flex items-center justify-between mb-6 flex-shrink-0">
                    <h3 className="text-white text-xl font-bold">🔥 추천 채용 공고</h3>
                    <span 
                        onClick={handleMoreClick}
                        className="text-sm text-gray-500 cursor-pointer hover:text-blue-400 transition-colors"
                    >
                        채용 지도로 이동
                    </span>
                </div>

                {/* 리스트 내부 스크롤 */}
                <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar pb-10">
                    {MOCK_JOBS.map((job) => (
                        <div key={job.id} className="w-full flex-shrink-0">
                            <JobCard {...job} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}