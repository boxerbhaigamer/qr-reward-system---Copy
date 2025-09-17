document.addEventListener("DOMContentLoaded", () => {
  const generateBtn = document.getElementById("generateBtn");
  const downloadZipBtn = document.getElementById("downloadZipBtn");
  const downloadCSVBtn = document.getElementById("downloadCSVBtn");
  const loadingDiv = document.getElementById("loading");
  const previewArea = document.getElementById("previewArea");
  const downloadArea = document.getElementById("downloadArea");
  const categorySelect = document.getElementById("category");
  const countInput = document.getElementById("count");

  let zip;
  const qrDataset = [];

  // Your Supabase details
  const SUPABASE_URL = "https://jlxuawdjplzrvzdyjsnd.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpseHVhd2RqcGx6cnZ6ZHlqc25kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Mzg2NzUsImV4cCI6MjA3MzQxNDY3NX0.G-KHb-guiyadVbQhIfTH1q03ENSZpFv_G65qiThmq3k";
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  // Added: The list of prizes per category
  const prizesByCategory = {
    "Car": ["500rs", "Movie Ticket", "Car Air Freshener", "Smart Water Bottle", "Bluetooth earphones"],
    "Bike": ["100rs", "200rs", "250rs"],
    "Health": ["Yoga accessories", "Coffee mug", "Pharmacy coupon"],
  };

  function base64ToBlob(base64, mime) {
    const byteChars = atob(base64.split(",")[1]);
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
    return new Blob([new Uint8Array(byteNumbers)], { type: mime });
  }

  const createQrCode = (url) =>
    new Promise((resolve) => {
      const tempDiv = document.createElement("div");
      new QRCode(tempDiv, { text: url, width: 256, height: 256 });
      setTimeout(() => {
        const canvas = tempDiv.querySelector("canvas");
        resolve(canvas ? canvas.toDataURL("image/png") : null);
      }, 20);
    });

  function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  }

  async function saveToSupabase(entry) {
    const { error } = await supabase.from("qr_codes").insert([entry]);
    if (error) console.error("❌ Supabase insert error:", error);
  }

  generateBtn.addEventListener("click", async () => {
    const category = categorySelect.value;
    const count = parseInt(countInput.value);
    if (isNaN(count) || count <= 0) {
      alert("Invalid count");
      return;
    }

    loadingDiv.classList.remove("hidden");
    previewArea.classList.add("hidden");
    previewArea.innerHTML = "";
    downloadArea.classList.add("hidden");
    generateBtn.disabled = true;
    zip = new JSZip();
    qrDataset.length = 0;

    const prizes = prizesByCategory[category];
    if (!prizes || prizes.length === 0) {
      alert(`No prizes defined for the category: ${category}`);
      loadingDiv.classList.add("hidden");
      generateBtn.disabled = false;
      return;
    }

    for (let i = 0; i < count; i++) {
      const claimId = generateUniqueId();
      const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];

      const url = `https://qr-reward-system.vercel.app/claim.html?claimId=${claimId}`;
      const base64Url = await createQrCode(url);

      if (base64Url) {
        const img = document.createElement("img");
        img.src = base64Url;
        img.className = "w-full h-auto rounded-lg shadow-md";
        previewArea.appendChild(img);

        zip.file(`qr-${category}-${claimId}.png`, base64ToBlob(base64Url, "image/png"));

        const entry = {
          qrId: claimId,
          category,
          rewardType: randomPrize,
          generatedAt: new Date().toISOString(),
          claimed: false,
          claimedAt: null,
          name: null,
          feedback: null,
        };

        qrDataset.push(entry);

        await saveToSupabase(entry);
      }
    }

    loadingDiv.classList.add("hidden");
    previewArea.classList.remove("hidden");
    downloadArea.classList.remove("hidden");
    generateBtn.disabled = false;
  });

  downloadZipBtn.addEventListener("click", async () => {
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "qr_rewards.zip");
  });

  downloadCSVBtn.addEventListener("click", () => {
    if (!qrDataset.length) {
      alert("No data");
      return;
    }
    const headers = Object.keys(qrDataset[0]);
    const csvRows = [headers.join(",")];
    qrDataset.forEach((row) => {
      csvRows.push(headers.map((h) => `"${row[h] ?? ""}"`).join(","));
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    saveAs(blob, "qr_dataset.csv");
  });

  window.qrDataset = qrDataset;
});