const stations = [
  {
    id: "s1",
    name: "南湖能源港超充站",
    area: "南湖商务区",
    address: "南湖大道 88 号地下停车场 B1",
    type: "super",
    typeLabel: "超充",
    power: 250,
    total: 18,
    available: 12,
    price: 1.28,
    wait: 4,
    open: true,
    x: 68,
    y: 38,
    distance: 1.8,
  },
  {
    id: "s2",
    name: "星环广场快充站",
    area: "星环广场",
    address: "星环路与云桥路交叉口西侧",
    type: "fast",
    typeLabel: "快充",
    power: 120,
    total: 12,
    available: 5,
    price: 1.06,
    wait: 10,
    open: true,
    x: 42,
    y: 30,
    distance: 2.4,
  },
  {
    id: "s3",
    name: "智谷园区慢充点",
    area: "智谷产业园",
    address: "智谷东路 16 号园区 P3 停车区",
    type: "slow",
    typeLabel: "慢充",
    power: 22,
    total: 20,
    available: 15,
    price: 0.78,
    wait: 0,
    open: true,
    x: 27,
    y: 47,
    distance: 3.1,
  },
  {
    id: "s4",
    name: "高铁东站超充枢纽",
    area: "交通枢纽",
    address: "高铁东站 P2 网约车停车区",
    type: "super",
    typeLabel: "超充",
    power: 360,
    total: 24,
    available: 7,
    price: 1.42,
    wait: 16,
    open: true,
    x: 78,
    y: 56,
    distance: 5.5,
  },
  {
    id: "s5",
    name: "滨河公园光储充站",
    area: "滨河公园",
    address: "滨河绿道北门停车场",
    type: "fast",
    typeLabel: "快充",
    power: 160,
    total: 10,
    available: 8,
    price: 0.98,
    wait: 2,
    open: true,
    x: 61,
    y: 67,
    distance: 4.2,
  },
  {
    id: "s6",
    name: "西城生活中心充电站",
    area: "西城生活中心",
    address: "青桐路 199 号地面停车区",
    type: "fast",
    typeLabel: "快充",
    power: 90,
    total: 8,
    available: 1,
    price: 1.18,
    wait: 22,
    open: true,
    x: 18,
    y: 26,
    distance: 6.7,
  },
  {
    id: "s7",
    name: "环城北路公共慢充点",
    area: "老城片区",
    address: "环城北路 36 号公共停车楼",
    type: "slow",
    typeLabel: "慢充",
    power: 7,
    total: 16,
    available: 0,
    price: 0.66,
    wait: 45,
    open: false,
    x: 30,
    y: 18,
    distance: 7.8,
  },
  {
    id: "s8",
    name: "会展中心旗舰超充站",
    area: "国际会展中心",
    address: "会展中轴路 9 号南广场",
    type: "super",
    typeLabel: "超充",
    power: 480,
    total: 30,
    available: 18,
    price: 1.36,
    wait: 0,
    open: true,
    x: 53,
    y: 53,
    distance: 0.9,
  },
];

const state = {
  selectedId: "s8",
  type: "all",
  minPorts: 0,
  openOnly: false,
  routeMode: true,
  query: "",
};

const typeFilter = document.querySelector("#typeFilter");
const portsFilter = document.querySelector("#portsFilter");
const portsValue = document.querySelector("#portsValue");
const openOnly = document.querySelector("#openOnly");
const routeMode = document.querySelector("#routeMode");
const searchInput = document.querySelector("#searchInput");
const resetBtn = document.querySelector("#resetBtn");
const stationLayer = document.querySelector("#stationLayer");
const stationList = document.querySelector("#stationList");
const stationDetail = document.querySelector("#stationDetail");
const resultCount = document.querySelector("#resultCount");
const routeLine = document.querySelector("#routeLine");
const totalStations = document.querySelector("#totalStations");
const availablePorts = document.querySelector("#availablePorts");
const avgPrice = document.querySelector("#avgPrice");

function getFilteredStations() {
  const query = state.query.trim().toLowerCase();
  return stations.filter((station) => {
    const matchesType = state.type === "all" || station.type === state.type;
    const matchesPorts = station.available >= state.minPorts;
    const matchesOpen = !state.openOnly || station.open;
    const haystack = `${station.name} ${station.area} ${station.address}`.toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    return matchesType && matchesPorts && matchesOpen && matchesQuery;
  });
}

function getSelected(filtered) {
  return filtered.find((station) => station.id === state.selectedId) || filtered[0] || stations[0];
}

function stationClass(station) {
  return station.open ? station.type : "closed";
}

function renderPins(filtered, selected) {
  const visibleIds = new Set(filtered.map((station) => station.id));
  stationLayer.innerHTML = stations
    .map((station) => {
      const hidden = visibleIds.has(station.id) ? "" : " hidden";
      const selectedClass = station.id === selected.id ? " selected" : "";
      return `<button class="pin ${stationClass(station)}${selectedClass}${hidden}" data-id="${station.id}" style="left:${station.x}%;top:${station.y}%" aria-label="${station.name}"></button>`;
    })
    .join("");

  stationLayer.querySelectorAll(".pin").forEach((pin) => {
    pin.addEventListener("click", () => {
      state.selectedId = pin.dataset.id;
      render();
    });
  });
}

function renderRoute(filtered, selected) {
  if (!state.routeMode || !filtered.length) {
    routeLine.innerHTML = "";
    return;
  }

  const routeStops = [...filtered]
    .filter((station) => station.open && station.available > 0)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 4);

  if (!routeStops.some((station) => station.id === selected.id)) {
    routeStops.unshift(selected);
  }

  const points = routeStops
    .slice(0, 5)
    .map((station) => `${station.x * 10},${station.y * 6.8}`)
    .join(" ");

  routeLine.innerHTML = `<path d="M ${points.replaceAll(" ", " L ")}"></path>`;
}

function renderDetail(station) {
  const status = station.open ? "营业中" : "维护中";
  const statusClass = station.open ? "" : " closed";
  stationDetail.innerHTML = `
    <span class="status${statusClass}">${status}</span>
    <h2>${station.name}</h2>
    <div class="station-address">${station.address}</div>
    <div class="detail-grid">
      <div class="metric"><strong>${station.available}/${station.total}</strong><span class="detail-meta">可用枪位</span></div>
      <div class="metric"><strong>${station.power}kW</strong><span class="detail-meta">${station.typeLabel}峰值功率</span></div>
      <div class="metric"><strong>${station.price.toFixed(2)}</strong><span class="detail-meta">元/度</span></div>
      <div class="metric"><strong>${station.wait}min</strong><span class="detail-meta">预计等待</span></div>
    </div>
  `;
}

function renderList(filtered, selected) {
  resultCount.textContent = `${filtered.length} 个结果`;
  stationList.innerHTML = filtered
    .sort((a, b) => b.available - a.available || a.distance - b.distance)
    .map((station) => `
      <button class="station-card ${station.id === selected.id ? "active" : ""}" data-id="${station.id}">
        <h3>${station.name}</h3>
        <div class="station-meta">
          <span>${station.typeLabel} · ${station.power}kW</span>
          <span>${station.available}/${station.total} 可用</span>
        </div>
        <div class="station-meta">
          <span>${station.distance.toFixed(1)} km</span>
          <span>${station.price.toFixed(2)} 元/度</span>
        </div>
      </button>
    `)
    .join("");

  stationList.querySelectorAll(".station-card").forEach((card) => {
    card.addEventListener("click", () => {
      state.selectedId = card.dataset.id;
      render();
    });
  });
}

function renderSummary(filtered) {
  const available = filtered.reduce((sum, station) => sum + station.available, 0);
  const price = filtered.length
    ? filtered.reduce((sum, station) => sum + station.price, 0) / filtered.length
    : 0;
  totalStations.textContent = filtered.length;
  availablePorts.textContent = available;
  avgPrice.textContent = price.toFixed(2);
}

function render() {
  const filtered = getFilteredStations();
  const selected = getSelected(filtered);
  state.selectedId = selected.id;
  portsValue.textContent = state.minPorts;
  renderSummary(filtered);
  renderPins(filtered, selected);
  renderRoute(filtered, selected);
  renderDetail(selected);
  renderList(filtered, selected);
}

typeFilter.addEventListener("change", (event) => {
  state.type = event.target.value;
  render();
});

portsFilter.addEventListener("input", (event) => {
  state.minPorts = Number(event.target.value);
  render();
});

openOnly.addEventListener("change", (event) => {
  state.openOnly = event.target.checked;
  render();
});

routeMode.addEventListener("change", (event) => {
  state.routeMode = event.target.checked;
  render();
});

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  render();
});

resetBtn.addEventListener("click", () => {
  state.type = "all";
  state.minPorts = 0;
  state.openOnly = false;
  state.routeMode = true;
  state.query = "";
  typeFilter.value = state.type;
  portsFilter.value = state.minPorts;
  openOnly.checked = state.openOnly;
  routeMode.checked = state.routeMode;
  searchInput.value = "";
  render();
});

render();
