(function () {
  const canvas = document.getElementById("forecast-chart");
  if (!canvas || !window.Chart) return;

  const loader = document.getElementById("forecast-loader");
  const errBox = document.getElementById("forecast-error");

  const COLORS = ["#2e7d32", "#f57c00", "#5d4037"];

  fetch("/api/forecast")
    .then((r) => {
      if (!r.ok) throw new Error("Forecast request failed");
      return r.json();
    })
    .then((rows) => {
      const months = [...new Set(rows.map((r) => r.month))];
      const crops = [...new Set(rows.map((r) => r.crop))];

      const datasets = crops.map((crop, i) => ({
        label: crop,
        data: months.map((m) => {
          const hit = rows.find((r) => r.crop === crop && r.month === m);
          return hit ? hit.predicted_demand : null;
        }),
        borderColor: COLORS[i % COLORS.length],
        backgroundColor: COLORS[i % COLORS.length] + "22",
        tension: 0.35,
        borderWidth: 3,
        pointRadius: 4,
        fill: true,
      }));

      if (loader) loader.classList.add("hidden");
      canvas.classList.remove("hidden");

      new Chart(canvas, {
        type: "line",
        data: { labels: months, datasets },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "bottom", labels: { font: { size: 14 } } },
            title: { display: false },
          },
          scales: {
            y: { title: { display: true, text: "Predicted demand (units)" }, beginAtZero: true },
          },
        },
      });
    })
    .catch((e) => {
      if (loader) loader.classList.add("hidden");
      if (errBox) {
        errBox.textContent = "Couldn't load the forecast right now. Please try again.";
        errBox.classList.remove("hidden");
      }
      console.error(e);
    });
})();
