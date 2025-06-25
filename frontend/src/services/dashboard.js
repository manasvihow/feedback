export async function getEmployeeList(email) {
    const res = await fetch(`http://localhost:8000/dashboard/team-members?user_email=${email}`);
    if (!res.ok) throw new Error("Failed to fetch feedback");
    return res.json();
  }

  export async function getAnalyticsData(email) {
    const res = await fetch(`http://localhost:8000/dashboard/all-analytics?user_email=${email}`);
    if (!res.ok) throw new Error("Failed to fetch feedback");
    return res.json();
  }