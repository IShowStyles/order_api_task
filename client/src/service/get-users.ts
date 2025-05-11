export async function fetchUsers() {
  try {
    const API_URL = import.meta.env.VITE_API_URL as string;
    console.log(API_URL);
    const response = await fetch(API_URL + "/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return (await response.json()) || [];
  } catch (error) {
    console.error("Error fetching users:", error.message);
    throw error;
  }
}
