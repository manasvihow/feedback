import { useEffect, useState, useContext } from "react";
import { getFeedbackList } from "../services/feedback";
import { UserContext } from "../services/contexts";
import CreateFeedbackForm from "./CreateFeedbackForm";

export default function FeedbackTable({
  setSelectedFeedback,
  setCreate
}) {
  const { user } = useContext(UserContext);
  const [feedbacks, setFeedbacks] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getFeedbackList(user?.email);
        setFeedbacks(data);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchData();
  }, [user?.email]);

  const sentimentColors = {
    positive: { bg: "bg-[#D5EDD9]", text: "text-[#2A5C3A]" },
    neutral: { bg: "bg-[#E8E3D9]", text: "text-[#5A5A5A]" },
    negative: { bg: "bg-[#F8D7D3]", text: "text-[#A63A3A]" },
    default: { bg: "bg-gray-100", text: "text-gray-600" },
  };

  const statusColors = {
    requested: { bg: "bg-[#E8E0F2]", text: "text-[#4A2C82]" },
    draft: { bg: "bg-[#F5E9D2]", text: "text-[#8C6A3D]" },
    submitted: { bg: "bg-[#D9EDE5]", text: "text-[#1E6B52]" },
    acknowledged: { bg: "bg-[#FCE8D5]", text: "text-[#B35930]" },
    default: { bg: "bg-gray-100", text: "text-gray-600" },
  };

  return (
    <div className="font-sans">
      {error && (
        <div className="text-red-500 mb-4 p-2 rounded bg-red-50">{error}</div>
      )}

      <div className="rounded-xl shadow-sm overflow-hidden border border-gray-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-[#F9F9F9]">
            <tr className="uppercase text-xs tracking-wider text-[#555555]">
              <th className="p-4 text-left font-medium">{user.role === "manager" ? "Employee " : ""}Name</th>
              <th className="p-4 text-left font-medium">Feedback</th>
              <th className="p-4 text-left font-medium">Sentiment</th>
              <th className="p-4 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="text-[#444444]">
            {feedbacks.map((fb) => (
              <tr
                key={fb.id}
                className="border-t border-gray-100 hover:bg-[#FAFAFA] transition-colors duration-150"
              >
                <td className="p-4 font-medium">
                  {user?.role === "manager" ? fb.employee_name : fb.creator_name}
                </td>
                <td
                  className={`p-4 text-[#D95B43] hover:text-[#B35930] ${
                     "hover:underline cursor-pointer"
                  } transition-colors`}
                  onClick={() => {
                    setSelectedFeedback(fb);
                    setCreate((["draft", "requested"].includes(fb.status) && user.email == fb.creator_email)? true : false )
                  }}
                >
                  {fb.status === "requested" && user.email == fb.creator_email
                    ? "Give Feedback"
                    : fb.preview}
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      (sentimentColors[fb.sentiment] || sentimentColors.default)
                        .bg
                    } ${
                      (sentimentColors[fb.sentiment] || sentimentColors.default)
                        .text
                    }`}
                  >
                    {fb.sentiment}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                      (statusColors[fb.status] || statusColors.default).bg
                    } ${
                      (statusColors[fb.status] || statusColors.default).text
                    }`}
                  >
                    {fb.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
