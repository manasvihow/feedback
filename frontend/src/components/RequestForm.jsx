import { useContext, useState } from "react";
import { UserContext } from "../services/contexts";
import { requestFeedback } from "../services/feedback";

export default function RequestForm({setRequestorEmail, onBack }) {
  const { email } = useContext(UserContext);

  const [giverEmail, setGiverEmail] = useState("");
  const [tags, setTags] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const res = await requestFeedback({
        requestor_email: email,
        giver_email: giverEmail,
        tags: tagList,
      });

      setMessage(res.message);
      setGiverEmail("");
      setRequestorEmail(email);
      setTags("");
    } catch (err) {
      setError(err?.response?.data?.detail || "Something went wrong.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 max-w-xl">
      <button
        onClick={onBack}
        className="text-sm text-blue-600 hover:underline mb-4"
      >
        ← Back
      </button>

      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Request Feedback
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Manager's Email"
          value={giverEmail}
          onChange={(e) => setGiverEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl shadow-sm"
        >
          Request Feedback
        </button>

        {message && <p className="text-green-600">{message}</p>}
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  );
}
