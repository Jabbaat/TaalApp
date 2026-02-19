
async function testLogin() {
    try {
        console.log("Attempting to connect to backend...");
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: "test@test.com", "password": "password" })
        });

        console.log(`Response Status: ${response.status}`);
        const data = await response.json();
        console.log("Response Data:", JSON.stringify(data));

        if (response.ok || response.status === 401 || response.status === 400 || response.status === 404) {
            console.log("✅ Backend is reachable and responding!");
        } else {
            console.log("❌ Backend responded with error:", response.status);
        }
    } catch (error) {
        console.error("❌ Failed to fetch:", error.message);
    }
}

testLogin();
