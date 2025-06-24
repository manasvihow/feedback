export const getFeedbackList = async (email) => {
  const res = await fetch(`http://127.0.0.1:8000/feedback/get-all?email=${email}`);

  if (!res.ok) {
    throw new Error("Failed to fetch feedback");
  }

  const data = await res.json();
  return data;
};

export async function getFeedbackById(id, email) {
  const res = await fetch(`http://localhost:8000/feedback/${id}?requestor_email=${email}`);
  if (!res.ok) throw new Error("Failed to fetch feedback");
  return res.json();
}

const BASE_URL = "http://localhost:8000/feedback"; // Update this if needed

export async function submitFeedback(payload) {
  const endpoint =
    payload.status === "draft"
      ? `${BASE_URL}/draft`
      : `${BASE_URL}/create`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const contentType = res.headers.get("content-type");

  if (!res.ok) {
    if (contentType && contentType.includes("application/json")) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to submit feedback");
    } else {
      throw new Error("Unexpected error. Check if the backend route exists.");
    }
  }

  return await res.json();
}
