import { useContext, useEffect, useState } from "react";
import { UserContext } from "../services/contexts";
import TeamMemberList from "../components/dashboard/TeamMemberList";
import { getAnalyticsData } from "../services/dashboard";
import FeedbackDashboard from "./dashboard/FeedbackDashboard";

export default function Dashboard() {
    const { user } = useContext(UserContext);

    const [feedbackAnalytics, setFeedbackAnalytics] = useState([])

    useEffect(() => {
      async function fetchAnalytics(){
        const data = await getAnalyticsData(user?.email);
        setFeedbackAnalytics(data);
      }
    
      fetchAnalytics();
    }, [])

    return (
        <div className="sm:px-6 lg:px-8 py-6 mt-12 bg-gray-50">
            <h1 className="text-2xl font-bold text-[#5C2849] mb-6">
                Dashboard 
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div>
                <TeamMemberList />
              </div>
              <div className="col-span-3 h-2/3 overflow-scroll">
                <FeedbackDashboard feedbackAnalytics={feedbackAnalytics} />
              </div>
            </div>
        </div>
    );
}
