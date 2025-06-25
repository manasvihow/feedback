import { useEffect, useState, useRef, useContext } from "react";
import { acknowledge, getFeedbackById } from "../services/feedback";
import html2pdf from "html2pdf.js";
import ReactMarkdown from "react-markdown";
import { UserContext } from "../services/contexts";

export default function FeedbackDetail({ id, onBack }) {
  const {user} = useContext(UserContext);
  const email = user?.email;
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState("");
  const pdfRef = useRef();

  const statusColors = {
    requested: { bg: "bg-[#E8E0F2]", text: "text-[#4A2C82]" },
    draft: { bg: "bg-[#F5E9D2]", text: "text-[#8C6A3D]" },
    submitted: { bg: "bg-[#D9EDE5]", text: "text-[#1E6B52]" },
    acknowledged: { bg: "bg-[#FCE8D5]", text: "text-[#B35930]" },
    default: { bg: "bg-gray-100", text: "text-gray-600" },
  };

  const sentimentColors = {
    positive: { bg: "bg-[#D5EDD9]", text: "text-[#2A5C3A]" },
    neutral: { bg: "bg-[#E8E3D9]", text: "text-[#5A5A5A]" },
    negative: { bg: "bg-[#F8D7D3]", text: "text-[#A63A3A]" },
    default: { bg: "bg-gray-100", text: "text-gray-600" },
  };

  useEffect(() => {
    async function fetchFeedback() {
      try {
        const data = await getFeedbackById(id, email);
        setFeedback(data);
      } catch (err) {
        setError("Could not fetch feedback.");
      }
    }
    fetchFeedback();
  }, [id, email]);

  if (error)
    return <div className="p-6 text-sm text-red-600 font-medium">{error}</div>;
  if (!feedback) return <div></div>;

  return (
    <div
      ref={pdfRef}
      className="w-full bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-4xl mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="text-[#555555] hover:text-[#5C2849] text-sm"
        >
          ← Back to Feedback
        </button>
        <button
          className="px-4 py-2 bg-[#5D4E6D] text-white rounded-lg hover:bg-[#4A3D56] text-sm"
          onClick={() => {
            const opt = {
              margin: 0.5,
              filename: `feedback-${id}.pdf`,
              image: { type: "jpeg", quality: 0.98 },
              html2canvas: { scale: 2 },
              jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
            };
            html2pdf().set(opt).from(pdfRef.current).save();
          }}
        >
          Download PDF
        </button>
      </div>

      <h2 className="text-xl font-semibold text-[#5C2849] mb-2">
        Feedback Details
      </h2>
      <p className="text-sm text-[#555555] mb-4">
        <span className="font-medium">Feedback ID:</span>{" "}
        <span className="font-mono">{id}</span>
      </p>

      <div className="text-xs font-extralight text-[#555555] space-y-1 mb-4">
        <p>
          <strong>Requested At:</strong>{" "}
          {feedback.requested_at
            ? new Date(feedback.requested_at).toLocaleString()
            : "NA"}
        </p>
        <p>
          <strong>Submitted At:</strong>{" "}
          {feedback.created_at
            ? new Date(feedback.created_at).toLocaleString()
            : "NA"}
        </p>
        <p>
          <strong>Acknowledged At:</strong>{" "}
          {feedback.acknowledged_at
            ? new Date(feedback.acknowledged_at).toLocaleString()
            : "NA"}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 text-sm text-[#555555] mb-6">
        <p>
          <strong>From:</strong> {feedback.created_by_email}
        </p>
        <p>
          <strong>To:</strong> {feedback.employee_email}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              (statusColors[feedback.status] || statusColors.default).bg
            } ${(statusColors[feedback.status] || statusColors.default).text}`}
          >
            {feedback.status}
          </span>
        </p>
        <p>
          <strong>Sentiment:</strong>{" "}
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              (sentimentColors[feedback.sentiment] || sentimentColors.default)
                .bg
            } ${
              (sentimentColors[feedback.sentiment] || sentimentColors.default)
                .text
            }`}
          >
            {feedback.sentiment}
          </span>
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-[#555555] mb-2">
          <strong>Strengths</strong>
        </label>
        <div className="p-3 border border-gray-200 rounded-lg bg-white prose prose-sm text-gray-700 max-w-none">
          <ReactMarkdown>{feedback.strengths || "—"}</ReactMarkdown>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-[#555555] mb-2">
          <strong>Areas to Improve</strong>
        </label>
        <div className="p-3 border border-gray-200 rounded-lg bg-white prose prose-sm text-gray-700 max-w-none">
          <ReactMarkdown>{feedback.areas_to_improve || "—"}</ReactMarkdown>
        </div>
      </div>

      {feedback.tags?.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#555555] mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {feedback.tags.map((tag, i) => (
              <span
                key={i}
                className="bg-[#E5E1F0] text-[#5C2849] text-xs px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
      {feedback.employee_email === user?.email && feedback.status !== "acknowledged" &&
        <button
          className="px-4 py-2 bg-[#5D4E6D] text-white rounded-lg hover:bg-[#4A3D56] text-sm"
          onClick={() => {
            acknowledge(user.email, id)
          }}
        >
          Acknowledge
        </button>}
    </div>
  );
}
