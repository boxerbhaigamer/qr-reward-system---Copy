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
  const SUPABASE_URL = "https://jlxuawdjplzrvzdyjsnd.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpseHVhd2RqcGx6cnZ6ZHlqc25kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Mzg2NzUsImV4cCI6MjA3MzQxNDY3NX0.G-KHb-guiyadVbQhIfTH1q03ENSZpFv_G65qiThmq3k";
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


  // Prize lists by category
  const PRIZES = {
    Car: [
      "₹500",
      "Movie ticket",
      "Car perfume",
      "Smart water bottle",
      "Bluetooth",
      "Mini car perfume",
      "Up to ₹1000"
    ],
    Bike: [
      "₹100",
      "₹200",
      "₹250"
    ],
    Health: [
      "Yoga accessories",
      "Pharmacy coupon",
      "Coffee mug"
    ]
  };

  function getRandomPrize(category) {
    const prizes = PRIZES[category] || [];
    if (prizes.length === 0) return null;
    return prizes[Math.floor(Math.random() * prizes.length)];
  }

  async function fetchReward() {
    let { data, error } = await supabase
      .from("qr_codes")
      .select("*")
      .eq("qrId", claimId)
      .single();

    if (error || !data) {
      rewardTitle.textContent = "QR code not found or expired.";
      return;
    }

    // If already claimed, show the prize (if any)
    if (data.claimed && data.prize) {
      rewardTitle.innerHTML = `🎉 Congratulations! You won: <b>${data.prize}</b>`;
      form.classList.add("hidden");
      return;
    }

    // If not claimed and no prize assigned, assign a random prize
    if (!data.prize) {
      // Try to get category from data (fallback to 'Car' if missing)
      const category = data.category || 'Car';
      const prize = getRandomPrize(category);
      if (prize) {
        // Update Supabase with the selected prize
        const { error: updateError } = await supabase
          .from("qr_codes")
          .update({ prize })
          .eq("qrId", claimId);
        if (!updateError) {
          data.prize = prize;
        }
      }
    }

    if (data.prize) {
      rewardTitle.innerHTML = `🎉 Congratulations! You won: <b>${data.prize}</b>`;
    } else {
      rewardTitle.textContent = `🎉 Congratulations! You won a reward!`;
    }
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
