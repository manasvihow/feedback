export const Login = async ({email, password}, setErrorMsg) => {
  try {
    const res = await fetch("http://127.0.0.1:8000/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Login failed");
    }

    alert("Login successful");
    return data;
  } catch (err) {
    setErrorMsg(err.message || "Something went wrong");
  }
};
