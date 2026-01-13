'use client';

import dynamic from 'next/dynamic';
import { useMemo, useRef, useEffect, useState } from 'react';

// SSR 방지
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { ssr: false });

export default function HeroBackground() {
    const fgRef = useRef<any>();
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const mouseRef = useRef({ x: 0, y: 0 });

    const data = useMemo(() => {
        const N = 200;
        const nodes = Array.from({ length: N }, (_, i) => ({ id: i }));
        const links = Array.from({ length: N }, (_, i) => ({
            source: i,
            target: Math.floor(Math.random() * N)
        }));
        return { nodes, links };
    }, []);

    useEffect(() => {
        // 창 크기 설정
        setDimensions({ width: window.innerWidth, height: window.innerHeight });

        const handleResize = () => {
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        let animationFrame: number;
        const animate = () => {
            if (fgRef.current) {
                const controls = fgRef.current.controls();
                if (controls) {
                    // 시차 효과 (Parallax) 계산
                    const targetX = mouseRef.current.x * 60;
                    const targetY = -mouseRef.current.y * 60;

                    controls.target.x += (targetX - controls.target.x) * 0.05;
                    controls.target.y += (targetY - controls.target.y) * 0.05;
                    controls.update();
                }
            }
            animationFrame = requestAnimationFrame(animate);
        };
        animate();

        // 초기 카메라 및 자동 회전 설정
        if (fgRef.current) {
            const controls = fgRef.current.controls();
            if (controls) {
                controls.autoRotate = true;
                controls.autoRotateSpeed = 1.0;
            }
            fgRef.current.cameraPosition({ z: 450 });
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrame);
        };
    }, []);

    if (dimensions.width === 0) return null;

    return (
        // z-0을 추가하여 글자(z-10)보다 뒤에 위치하게 함
        <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
            <ForceGraph3D
                ref={fgRef}
                graphData={data}
                width={dimensions.width}
                height={dimensions.height}
                backgroundColor="rgba(0,0,0,0)"
                showNavInfo={false}
                nodeColor={() => '#277FA9'}
                linkColor={() => '#ffffff'}
                linkOpacity={0.12}
                nodeRelSize={1.2}
                enableNodeDrag={false}
                enableNavigationControls={false}
            />
            {/* 중앙부 가독성을 위한 그라데이션 오버레이 */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(26,27,30,0.7)_100%)]" />
        </div>
    );
}