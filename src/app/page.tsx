import Hero from "@/components/home/Hero";
import JobSection from "@/components/home/JobSection";
import TrendSection from "@/components/home/TrendSection";
import Top5Section from "@/components/home/Top5Section";
import WithdrawalThanksModal from "@/components/home/WithdrawalThanksModal";

export default function Home({
  searchParams,
}: {
  searchParams?: { withdrawal?: string };
}) {
  const showWithdrawalThanks = searchParams?.withdrawal === "ok";

  return (
    <main className="min-h-screen bg-[#1A1B1E]">
      <Hero />

      {/* 12컬럼 그리드 시스템 도입 */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 왼쪽 (9컬럼 점유): 채용 공고 + 트렌드 리포트 */}
        <div className="lg:col-span-9 min-w-0 flex flex-col gap-10">
          <JobSection />
          <TrendSection />
        </div>

        {/* 오른쪽 (3컬럼 점유): 요즘 뜨는 Top 5 */}
        <aside className="lg:col-span-3">
          <Top5Section />
        </aside>
      </div>

      <WithdrawalThanksModal isOpen={showWithdrawalThanks} />
    </main>
  );
}