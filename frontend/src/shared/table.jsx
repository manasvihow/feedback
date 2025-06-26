import { useContext } from "react";
import { UserContext } from "../services/contexts";

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

export const Table = ({
    feedbacks,
    setSelectedFeedback,
    setCreate,
    handleDelete,
    isInbox,
    setError,
}) => {
    const { user } = useContext(UserContext);

    const formattedDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return feedbacks.length === 0 ? (
        <div className="text-center text-gray-700">No feedbacks to show</div>
    ) : (
        <table className="w-full text-sm">
            <thead className="bg-[#F9F9F9]">
                <tr className="uppercase text-xs tracking-wider text-[#555555]">
                    <th className="p-4 text-left font-medium">Date</th>
                    <th className="p-4 text-left font-medium">
                        {isInbox ? "FROM" : "TO"}
                    </th>
                    <th className="p-4 text-left font-medium">Feedback</th>
                    <th className="p-4 text-left font-medium">Sentiment</th>
                    <th className="p-4 text-left font-medium">Status</th>
                    {!isInbox && (
                        <th className="p-4 text-left font-medium w-12">
                            Action
                        </th>
                    )}
                </tr>
            </thead>
            <tbody className="text-[#444444]">
                {feedbacks.map((fb) => {
                    const status =
                        isInbox && fb.status === "draft" && fb.requested_at
                            ? "Pending"
                            : fb.status;

                    return (
                        <tr
                            key={fb.id}
                            className="border-t border-gray-100 hover:bg-[#FAFAFA] transition-colors duration-150"
                        >
                            <td className="p-4 font-medium">
                                {formattedDate(fb.updated_at)}
                            </td>
                            <td className="p-4 font-medium">
                                {isInbox ? fb.creator_name : fb.employee_name}
                            </td>
                            <td
                                className={`p-4 text-[#D95B43] hover:text-[#B35930] ${
                                    status === "Pending" &&
                                    "pointer-events-none"
                                } ${"hover:underline cursor-pointer"} transition-colors`}
                                onClick={() => {
                                    setSelectedFeedback(fb);
                                    setCreate(
                                        ["draft", "requested"].includes(
                                            fb.status
                                        ) && user.email == fb.creator_email
                                            ? true
                                            : false
                                    );
                                }}
                            >
                                {fb.status === "requested" &&
                                user.email == fb.creator_email
                                    ? "Give Feedback"
                                    : fb.preview}
                            </td>
                            <td className="p-4">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        (
                                            sentimentColors[fb.sentiment] ||
                                            sentimentColors.default
                                        ).bg
                                    } ${
                                        (
                                            sentimentColors[fb.sentiment] ||
                                            sentimentColors.default
                                        ).text
                                    }`}
                                >
                                    {fb.sentiment}
                                </span>
                            </td>
                            <td className="p-4">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                                        (
                                            statusColors[fb.status] ||
                                            statusColors.default
                                        ).bg
                                    } ${
                                        (
                                            statusColors[fb.status] ||
                                            statusColors.default
                                        ).text
                                    }`}
                                >
                                    {status}
                                </span>
                            </td>
                            {!isInbox && (
                                <td className="p-4">
                                    {fb.status === "draft" && (
                                        <div>
                                            <button
                                                className={`font-bold text-red-600 ${
                                                    fb.requested_at
                                                        ? "opacity-50"
                                                        : ""
                                                }`}
                                                onClick={() => {
                                                    if (fb.requested_at) {
                                                        setError(
                                                            "Requested Feedback cannot be deleted"
                                                        );
                                                    } else {
                                                        handleDelete(fb.id);
                                                    }
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </td>
                            )}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
};
