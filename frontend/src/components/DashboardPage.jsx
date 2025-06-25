import { useContext } from "react";
import { UserContext } from "../services/contexts";
import FeedbackCountCard from "../components/dashboard/FeedbackCountCard";
import SentimentTrendChart from "../components/dashboard/SentimentTrendChart";
import FeedbackTimeline from "../components/dashboard/FeedbackTimeline";
import TeamMemberList from "../components/dashboard/TeamMemberList";

export default function Dashboard() {
  const { role } = useContext(UserContext);

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 bg-gray-50">
      <h1 className="text-2xl font-bold text-[#5C2849] mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <FeedbackCountCard />
        {role === "manager" ? <SentimentTrendChart /> : <FeedbackTimeline />}
      </div>

      <TeamMemberList />
    </div>
  );
}
