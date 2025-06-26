import { useContext, useState } from "react";
import { UserContext } from "../services/contexts";
import { requestFeedback } from "../services/feedback";
import EmployeeList from "../shared/employeeList";

export default function RequestForm({ setRequestorEmail, onBack }) {
    const { user } = useContext(UserContext);

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
                requestor_email: user?.email,
                giver_email: giverEmail,
                tags: tagList,
            });

            setMessage(res.message);
            setGiverEmail("");
            setTags("");
        } catch (err) {
            console.log(err)
            setError(err?.response?.data?.detail || "Something went wrong.");
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 max-w-xl">
            <button
                onClick={onBack}
                className="text-[#555555] hover:text-[#5C2849] mb-4"
            >
                ← Back to Feedback
            </button>

            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Request Feedback
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <EmployeeList isCreateForm={false} form={{employee_email: giverEmail}} handleChange={(e) => {
                  setGiverEmail(e.target.value)
                }}
                  handleFirstChange={(data) => {
                    setGiverEmail(data)
                  }}
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
