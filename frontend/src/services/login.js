export const Login = async ({ email, password }) => {
  const res = await fetch("http://127.0.0.1:8000/user/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.detail || "Login failed");
  }
  
  return data;
};
