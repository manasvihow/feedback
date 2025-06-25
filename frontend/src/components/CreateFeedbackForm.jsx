import { useState, useContext, useRef, useEffect } from "react";
import { getFeedbackById, submitFeedback } from "../services/feedback";
import { UserContext } from "../services/contexts";
import ReactMarkdown from "react-markdown";
import { getEmployeeList } from "../services/dashboard";
import { Required } from "../shared/required";
import EmployeeList from "../shared/employeeList";

export default function CreateFeedbackForm({
    setRequestorEmail,
    requestorEmail,
    onClose,
    selectedFeedback,
}) {
    const { user } = useContext(UserContext);
    const strengthsTextareaRef = useRef(null);
    const improvementsTextareaRef = useRef(null);

    const timeoutIdRef = useRef();

    const [form, setForm] = useState({
        employee_email: requestorEmail,
        strengths: "",
        areas_to_improve: "",
        sentiment: "positive",
        tags: "",
        is_anon: false,
    });

    useEffect(() => {
      if(!selectedFeedback) return;
        async function fetchFeedback() {
            try {
                const {
                    employee_email,
                    strengths,
                    areas_to_improve,
                    sentiment,
                    tags,
                    is_anon,
                } = await getFeedbackById(selectedFeedback?.id, requestorEmail);
                setForm({
                    employee_email,
                    strengths,
                    areas_to_improve,
                    sentiment: sentiment || form.sentiment,
                    tags,
                    is_anon,
                });
            } catch (err) {
                setError("Could not fetch feedback.");
            }
        }
        fetchFeedback();
    }, [selectedFeedback?.id]);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [previewTabStrengths, setPreviewTabStrengths] = useState("write");
    const [previewTabImprovements, setPreviewTabImprovements] =
        useState("write");

    useEffect(() => {
      if(timeoutIdRef.current){
        clearTimeout(timeoutIdRef.current)
      }
      timeoutIdRef.current = setTimeout(() => {setSuccess("")}, 5000);
    }, [success])
    
    useEffect(() => {
        const resizeTextarea = (textarea) => {
            if (textarea) {
                textarea.style.height = "auto";
                textarea.style.height = `${textarea.scrollHeight}px`;
            }
        };

        resizeTextarea(strengthsTextareaRef.current);
        resizeTextarea(improvementsTextareaRef.current);
    }, [form.strengths, form.areas_to_improve]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (status) => {
        setError("");
        setSuccess("");

        const payload = {
            ...form,
            created_by_email: user?.email,
            feedbackId: selectedFeedback?.id || "",
            status,
            tags: Array.isArray(form.tags) ? form.tags : form.tags.split(",").map((t) => t.trim()),
        };

        try {
            const res = await submitFeedback(payload);
            setSuccess(res.message);

            if (status === "submitted") {
                setTimeout(() => {
                    onClose();
                    setSuccess("");
                    setRequestorEmail("");
                }, 1500);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="w-full bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-[#5C2849]">
                    Create Feedback
                </h2>
                <button
                    onClick={onClose}
                    className="text-[#555555] hover:text-[#5C2849]"
                >
                    ← Back to Feedback
                </button>
            </div>

            <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <EmployeeList handleFirstChange={(data) => {
                        handleChange({target: {name: "employee_email", value: data}})
                    }} form={form} handleChange={handleChange}/>
                    <div>
                    <div className="flex">
                        <label className="block text-sm font-medium text-[#555555] mb-2">
                            Sentiment
                        </label>
                        <Required />
                        </div>
                        <select
                            name="sentiment"
                            value={form.sentiment}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5D4E6D] focus:border-transparent"
                        >
                            <option value="positive">Positive</option>
                            <option value="neutral">Neutral</option>
                            <option value="negative">Negative</option>
                        </select>
                    </div>
                </div>

                {/* Strengths Field */}
                <div>
                    <label className="flex justify-between items-center text-sm font-medium mb-2">
                    <div className="flex">
                        <h1 className="block text-sm font-medium text-[#555555]">
                            Strengths
                        </h1>
                        <Required />
                        </div>
                        <div className="flex">
                            <button
                                type="button"
                                onClick={() => setPreviewTabStrengths("write")}
                                className={`px-4 py-2 font-medium ${
                                    previewTabStrengths === "write"
                                        ? "text-[#5C2849] bg-[#5c284912]"
                                        : "text-[#555555]"
                                }`}
                            >
                                Write
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    setPreviewTabStrengths("preview")
                                }
                                className={`px-4 py-2 font-medium ${
                                    previewTabStrengths === "preview"
                                        ? "text-[#5C2849] bg-[#5c284912]"
                                        : "text-[#555555]"
                                }`}
                            >
                                Preview
                            </button>
                        </div>
                    </label>

                    {previewTabStrengths === "write" ? (
                        <textarea
                            ref={strengthsTextareaRef}
                            name="strengths"
                            value={form.strengths}
                            onChange={handleChange}
                            required
                            rows={5}
                            placeholder="Use Markdown to format your text (e.g., **bold**, *italic*, lists)"
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5D4E6D] focus:border-transparent resize-none overflow-y-auto"
                            style={{ minHeight: "120px" }}
                        />
                    ) : (
                        <div className="p-3 border border-gray-200 rounded-lg min-h-[200px] max-h-[400px] overflow-y-auto">
                            <div className="prose prose-sm">
                                <ReactMarkdown>
                                    {form.strengths || "Nothing to preview"}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>

                {/* Areas to Improve */}
                <div>
                    <label className="flex justify-between items-center text-sm font-medium mb-2">
                    <div className="flex">
                        <h1 className="block text-sm font-medium text-[#555555]">
                            Areas to improve
                        </h1>
                        <Required />
                        </div>
                        <div className="flex">
                            <button
                                type="button"
                                onClick={() =>
                                    setPreviewTabImprovements("write")
                                }
                                className={`px-4 py-2 font-medium ${
                                    previewTabImprovements === "write"
                                        ? "text-[#5C2849] bg-[#5c284912]"
                                        : "text-[#555555]"
                                }`}
                            >
                                Write
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    setPreviewTabImprovements("preview")
                                }
                                className={`px-4 py-2 font-medium ${
                                    previewTabImprovements === "preview"
                                        ? "text-[#5C2849] bg-[#5c284912]"
                                        : "text-[#555555]"
                                }`}
                            >
                                Preview
                            </button>
                        </div>
                    </label>

                    {previewTabImprovements === "write" ? (
                        <textarea
                            ref={improvementsTextareaRef}
                            name="areas_to_improve"
                            value={form.areas_to_improve}
                            onChange={handleChange}
                            required
                            rows={5}
                            placeholder="Use Markdown to format your text (e.g., **bold**, *italic*, lists)"
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5D4E6D] focus:border-transparent resize-none overflow-y-auto"
                            style={{ minHeight: "120px" }}
                        />
                    ) : (
                        <div className="p-3 border border-gray-200 rounded-lg min-h-[200px] max-h-[400px] overflow-y-auto">
                            <div className="prose prose-sm">
                                <ReactMarkdown>
                                    {form.areas_to_improve ||
                                        "Nothing to preview"}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>

                {/* Tags and Anonymous */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-[#555555] mb-2">
                            Tags (comma separated)
                        </label>
                        <input
                            type="text"
                            name="tags"
                            value={form.tags}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5D4E6D] focus:border-transparent"
                        />
                    </div>

                    <div className="flex items-center gap-3 mt-8">
                        <input
                            type="checkbox"
                            name="is_anon"
                            checked={form.is_anon}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-gray-300 text-[#5D4E6D] focus:ring-[#5D4E6D]"
                        />
                        <label className="text-sm text-[#555555]">
                            Send Anonymously
                        </label>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-4 pt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 text-[#555555] hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSubmit("draft")}
                        className="px-6 py-2 bg-gray-200 text-[#333] rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Save as Draft
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSubmit("submitted")}
                        className="px-6 py-2 bg-[#5D4E6D] text-white rounded-lg hover:bg-[#4A3D56] transition-colors"
                    >
                        Submit Feedback
                    </button>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="p-4 bg-[#F8D7D3] text-[#A63A3A] rounded-lg text-sm">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="p-4 bg-[#D5EDD9] text-[#2A5C3A] rounded-lg text-sm">
                        {success}
                    </div>
                )}
            </form>
        </div>
    );
}
