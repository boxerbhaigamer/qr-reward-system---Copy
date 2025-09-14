document.addEventListener("DOMContentLoaded", () => {
  const rewardTitle = document.getElementById("rewardTitle");
  const form = document.getElementById("claimForm");
  const message = document.getElementById("message");
  const contactInput = document.getElementById("contactNumber");
  const feedbackInput = document.getElementById("feedback");

  // Get QR parameters from URL
  const params = new URLSearchParams(window.location.search);
  const claimId = params.get("claimId");

  // ✅ Supabase details
  const SUPABASE_URL = "https://twizpcfwkjuqjjygrbtf.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3aXpwY2Z3a2p1cWpqeWdyYnRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NDI2NDUsImV4cCI6MjA3MzQxODY0NX0.fs8NpTy20yztVnygTHqkoKDG6nRlmivqs4bbm2OKRYc";
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  async function fetchReward() {
    const { data, error } = await supabase
      .from("qr_codes")
      .select("*")
      .eq("qrId", claimId)
      .single();

    if (error || !data) {
      rewardTitle.textContent = "QR code not found or expired.";
      return;
    }

    rewardTitle.textContent = `🎉 Congratulations! You won a ${data.rewardType}`;
    form.classList.remove("hidden");
  }

  fetchReward();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const contactNumber = contactInput.value.trim();
    const feedback = feedbackInput.value.trim();

    if (!contactNumber) {
      alert("Please enter your contact number.");
      return;
    }

    const { error } = await supabase
      .from("qr_codes")
      .update({
        claimed: true,
        claimedAt: new Date().toISOString(),
        contactNumber,
        feedback,
      })
      .eq("qrId", claimId);

    if (error) {
      console.error(error);
      message.innerHTML = "❌ Failed to submit claim. Please try again.";
    } else {
      form.classList.add("hidden");
      message.innerHTML = "✅ Claim submitted! Our team will contact you soon.";
    }
  });
});
