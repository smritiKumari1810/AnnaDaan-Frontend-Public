(function () {
  const el = document.getElementById("map");
  if (!el || !window.L) return;

  const hub = {
    lat: parseFloat(el.dataset.hubLat),
    lng: parseFloat(el.dataset.hubLng),
    name: el.dataset.hubName || "Hub",
  };
  const buyer = {
    lat: parseFloat(el.dataset.buyerLat),
    lng: parseFloat(el.dataset.buyerLng),
  };

  const status = document.getElementById("route-status");
  const setStatus = (msg, isError) => {
    if (!status) return;
    status.textContent = msg;
    status.style.color = isError ? "#991b1b" : "";
  };

  const haveHub = !Number.isNaN(hub.lat) && !Number.isNaN(hub.lng);
  const haveBuyer = !Number.isNaN(buyer.lat) && !Number.isNaN(buyer.lng);

  if (!haveHub) {
    setStatus("No hub assigned yet — map unavailable.", true);
    return;
  }

  const map = L.map("map").setView([hub.lat, hub.lng], 11);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  L.marker([hub.lat, hub.lng]).addTo(map).bindPopup("🏭 " + hub.name).openPopup();

  if (!haveBuyer) {
    setStatus("Buyer location not set — showing hub only.");
    return;
  }

  L.marker([buyer.lat, buyer.lng]).addTo(map).bindPopup("📍 Delivery location");

  setStatus("Loading delivery route…");
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${hub.lng},${hub.lat};${buyer.lng},${buyer.lat}` +
    `?overview=full&geometries=geojson`;

  fetch(url)
    .then((r) => r.json())
    .then((data) => {
      if (!data.routes || !data.routes.length) throw new Error("no route");
      const route = data.routes[0];
      const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      const line = L.polyline(coords, { color: "#16a34a", weight: 5, opacity: 0.85 }).addTo(map);
      map.fitBounds(line.getBounds(), { padding: [40, 40] });

      const km = (route.distance / 1000).toFixed(1);
      const mins = Math.round(route.duration / 60);
      setStatus(`Route: ${km} km · about ${mins} min by road.`);
    })
    .catch(() => {
      const line = L.polyline(
        [[hub.lat, hub.lng], [buyer.lat, buyer.lng]],
        { color: "#334155", weight: 4, dashArray: "6 8" }
      ).addTo(map);
      map.fitBounds(line.getBounds(), { padding: [40, 40] });
      setStatus("Couldn't load the road route — showing direct line.", true);
    });
})();
