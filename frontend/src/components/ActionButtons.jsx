import { useContext } from "react";
import { UserContext } from "../services/contexts";

export default function ActionButtons({ onCreate, onRequest, onDashboard }) {
  const { user } = useContext(UserContext);

  return (
    <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 w-full">
      <h2 className="text-base font-semibold text-[#5C2849] mb-4">Actions</h2>

      <div className="flex flex-col gap-3">
        {user?.role === "manager" && (
          <button
            onClick={onCreate}
            className="bg-[#D95B43] hover:bg-[#B35930] text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 shadow-sm"
          >
            Create Feedback
          </button>
        )}

        {user?.role === "employee" && (
          <button
            onClick={onRequest}
            className="bg-[#D95B43] hover:bg-[#B35930] text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 shadow-sm"
          >
            Request Feedback
          </button>
        )}

        {user?.role === "manager" && <button
          onClick={onDashboard}
          className="bg-[#5D4E6D] hover:bg-[#4A3D56] text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 shadow-sm"
        >
          Go to Dashboard
        </button>}
      </div>
    </div>
  );
}
