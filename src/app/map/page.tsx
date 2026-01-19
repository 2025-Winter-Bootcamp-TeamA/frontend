"use client";

import { Container as MapDiv, NaverMap, Marker, useNavermaps, NavermapsProvider } from "react-naver-maps";
import { useState } from "react";
import { Building2, X } from "lucide-react";

// 1. 기업 데이터 (강남 & 판교)
const COMPANIES = [
  // 강남
  { id: 1, name: "Toss", lat: 37.500058, lng: 127.035547, logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Toss_Logo_Primary.png/800px-Toss_Logo_Primary.png" },
  { id: 2, name: "Coupang", lat: 37.515764, lng: 127.098075, logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Coupang_logo.svg/800px-Coupang_logo.svg.png" },
  // 판교
  { id: 4, name: "Kakao", lat: 37.395706, lng: 127.110433, logo: "https://upload.wikimedia.org/wikipedia/commons/e/e3/Kakao_Corp._logo.svg" },
  { id: 5, name: "Naver", lat: 37.359570, lng: 127.105399, logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Naver_Logotype.svg/800px-Naver_Logotype.svg.png" },
];

function MyMap() {
  const navermaps = useNavermaps();
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  return (
    <div className="w-full h-full relative group">
       {/* 🌑 다크모드 스타일링 (CSS Filter) */}
       <style jsx global>{`
        .naver-map-dark canvas {
            filter: invert(100%) hue-rotate(180deg) brightness(85%) contrast(120%) !important;
        }
      `}</style>

      {/* ⚠️ className 속성은 여기서 뺐습니다 (에러 방지) */}
      <NaverMap
        defaultCenter={new navermaps.LatLng(37.4500, 127.0700)}
        defaultZoom={11}
        minZoom={10}
        maxZoom={14}
      >
        {COMPANIES.map((company) => (
          <Marker
            key={company.id}
            position={new navermaps.LatLng(company.lat, company.lng)}
            onClick={() => setSelectedCompany(company)}
            icon={{
              content: `
                <div style="padding: 6px; background: rgba(255, 255, 255, 0.95); border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; width: 44px; height: 44px; border: 2px solid #3b82f6; cursor: pointer;">
                  ${company.logo 
                    ? `<img src="${company.logo}" style="width: 24px; height: 24px; object-fit: contain;" />` 
                    : `<div style="color: #333; font-weight: bold;">🏢</div>`
                  }
                </div>
                <div style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #3b82f6;"></div>
              `,
              size: new navermaps.Size(44, 44),
              // ✅ 여기가 수정되었습니다! (Size -> Point)
              anchor: new navermaps.Point(22, 50),
            }}
          />
        ))}
      </NaverMap>

      {/* 정보 오버레이 */}
      {selectedCompany && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[280px] bg-[#1A1B1E]/90 backdrop-blur-md text-white p-5 rounded-2xl border border-gray-700 shadow-2xl z-50 animate-in slide-in-from-bottom-4">
          <button onClick={() => setSelectedCompany(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
          <div className="flex items-center gap-4 mb-4">
             <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1">
                {selectedCompany.logo ? <img src={selectedCompany.logo} className="w-8 h-8 object-contain" /> : <Building2 className="text-black"/>}
             </div>
             <div>
                <h3 className="text-lg font-bold">{selectedCompany.name}</h3>
                <span className="text-xs text-blue-400 font-bold bg-blue-400/10 px-2 py-0.5 rounded-full">채용중 3건</span>
             </div>
          </div>
          <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-colors text-sm">
            공고 보러가기
          </button>
        </div>
      )}
    </div>
  );
}

export default function JobNaverMap() {
  return (
    // 👇 Client ID 확인!
    <NavermapsProvider ncpClientId="lchzrz5in9">
      {/* ✅ 다크모드 클래스는 여기에 적용 */}
      <div className="w-full h-[600px] rounded-[32px] overflow-hidden border border-gray-800 relative shadow-2xl naver-map-dark">
        <MapDiv style={{ width: '100%', height: '100%' }}>
          <MyMap />
        </MapDiv>
      </div>
    </NavermapsProvider>
  );
}