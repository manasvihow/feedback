import { useContext } from "react";
import { UserContext } from "../services/contexts"; 

export default function WelcomeBanner() {
  const user = useContext(UserContext);

  const getMessage = () => {
    if (user?.role === "manager") {
      return "Here's a quick view of your team's progress.";
    } else if (user?.role === "employee") {
      return "Check your recent feedback and stay on track.";
    }
    return "Welcome to FeedLoop.";
  };

  return (
    <div className="w-full px-6 py-5 mb-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h1 className="text-2xl font-semibold text-[#5C2849]">  {/* Deep Plum */}
        Welcome{user?.name ? `, ${user.name}` : ""}
      </h1>
      <p className="mt-2 text-[#555555]">  {/* Warm Gray */}
        {getMessage()}
      </p>
    </div>
  );
}