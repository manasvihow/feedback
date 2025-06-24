import { useEffect, useState, useRef } from "react";
import { getFeedbackById } from "../services/feedback";
import html2pdf from "html2pdf.js";
import ReactMarkdown from "react-markdown";

export default function FeedbackDetail({ id, email, onBack }) {
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState("");
  const pdfRef = useRef();

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
          <strong>Status:</strong> {feedback.status}
        </p>
        <p>
          <strong>Sentiment:</strong> {feedback.sentiment}
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
    </div>
  );
}
