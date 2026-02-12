const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function getHelloMessage() {
  const res = await fetch(`${API_BASE}/api/hello`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Backend did not return JSON");
  }

  return res.json();
}
