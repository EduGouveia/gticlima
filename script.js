const cepForm = document.querySelector("#cepForm");
const cepInput = document.querySelector("#cepInput");
const searchButton = document.querySelector("#searchButton");
const statusMessage = document.querySelector("#statusMessage");
const results = document.querySelector("#results");
const themeToggle = document.querySelector("#themeToggle");
const themeIcon = document.querySelector("#themeIcon");
const themeLabel = document.querySelector("#themeLabel");

const WEATHER_CODES = {
  0:  { label: "Céu limpo", icon: "☀️" },
  1:  { label: "Predominantemente limpo", icon: "🌤️" },
  2:  { label: "Parcialmente nublado", icon: "⛅" },
  3:  { label: "Nublado", icon: "☁️" },
  45: { label: "Nevoeiro", icon: "🌫️" },
  48: { label: "Nevoeiro com geada", icon: "🌫️" },
  51: { label: "Garoa fraca", icon: "🌦️" },
  53: { label: "Garoa moderada", icon: "🌦️" },
  55: { label: "Garoa intensa", icon: "🌧️" },
  56: { label: "Garoa congelante fraca", icon: "🌧️" },
  57: { label: "Garoa congelante intensa", icon: "🌧️" },
  61: { label: "Chuva fraca", icon: "🌦️" },
  63: { label: "Chuva moderada", icon: "🌧️" },
  65: { label: "Chuva forte", icon: "🌧️" },
  66: { label: "Chuva congelante fraca", icon: "🌧️" },
  67: { label: "Chuva congelante forte", icon: "🌧️" },
  71: { label: "Neve fraca", icon: "🌨️" },
  73: { label: "Neve moderada", icon: "🌨️" },
  75: { label: "Neve forte", icon: "❄️" },
  77: { label: "Grãos de neve", icon: "🌨️" },
  80: { label: "Pancadas de chuva fracas", icon: "🌦️" },
  81: { label: "Pancadas de chuva moderadas", icon: "🌧️" },
  82: { label: "Pancadas de chuva fortes", icon: "⛈️" },
  85: { label: "Pancadas de neve fracas", icon: "🌨️" },
  86: { label: "Pancadas de neve fortes", icon: "❄️" },
  95: { label: "Trovoadas", icon: "⛈️" },
  96: { label: "Trovoadas com granizo fraco", icon: "⛈️" },
  99: { label: "Trovoadas com granizo forte", icon: "⛈️" }
};
document.querySelector("#current-year").textContent =
    new Date().getFullYear();

function getWeatherInfo(code) {
  return WEATHER_CODES[code] ?? { label: "Condição não identificada", icon: "🌡️" };
}

function setStatus(message, type = "") {
  statusMessage.textContent = message;
  statusMessage.className = `status ${type}`.trim();
}

function setLoading(isLoading) {
  searchButton.disabled = isLoading;
  searchButton.textContent = isLoading ? "Consultando..." : "Consultar clima";
  cepInput.disabled = isLoading;
}

function formatDate(dateString, options = {}) {
  // Meio-dia evita que a data mude por diferenças de fuso horário.
  const date = new Date(`${dateString}T12:00:00`);
  return new Intl.DateTimeFormat("pt-BR", options).format(date);
}

function formatNumber(value, digits = 0) {
  const number = Number(value);
  return Number.isFinite(number)
    ? number.toLocaleString("pt-BR", { maximumFractionDigits: digits, minimumFractionDigits: digits })
    : "—";
}

async function fetchJson(url) {
  const response = await fetch(url);
  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("A API retornou uma resposta inválida.");
  }

  if (!response.ok) {
    throw new Error(data?.message || data?.error || "Não foi possível consultar o serviço.");
  }

  if (data?.error) {
    throw new Error(data.reason || "A API informou um erro na consulta.");
  }

  return data;
}

async function getAddressByCep(cep) {
  const url = `https://cep.awesomeapi.com.br/json/${encodeURIComponent(cep)}`;
  const data = await fetchJson(url);

  if (!data.lat || !data.lng || !data.city || !data.state) {
    throw new Error("O CEP foi encontrado, mas não há coordenadas suficientes para consultar o clima.");
  }

  return data;
}

async function getWeather(latitude, longitude) {
  const params = new URLSearchParams({
    latitude,
    longitude,
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "precipitation",
      "weather_code",
      "wind_speed_10m"
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "precipitation_sum"
    ].join(","),
    forecast_days: "5",
    timezone: "auto",
    wind_speed_unit: "kmh"
  });

  return fetchJson(`https://api.open-meteo.com/v1/forecast?${params}`);
}

function renderAddress(addressData) {
  const street = addressData.address || addressData.address_name || "";
  const district = addressData.district || "";
  const cityState = `${addressData.city} - ${addressData.state}`;

  document.querySelector("#locationName").textContent = cityState;
  document.querySelector("#locationAddress").textContent =
    [street, district].filter(Boolean).join(" • ") || "Endereço não detalhado pela API";
  document.querySelector("#locationCep").textContent = `CEP ${addressData.cep || "—"}`;
}

function renderCurrent(weather) {
  const current = weather.current;
  const info = getWeatherInfo(current.weather_code);

  document.querySelector("#currentIcon").textContent = info.icon;
  document.querySelector("#currentDescription").textContent = info.label;
  document.querySelector("#currentTemp").textContent = formatNumber(current.temperature_2m);
  document.querySelector("#feelsLike").textContent = formatNumber(current.apparent_temperature);
  document.querySelector("#humidity").textContent = `${formatNumber(current.relative_humidity_2m)}%`;
  document.querySelector("#precipitation").textContent = `${formatNumber(current.precipitation, 1)} mm`;
  document.querySelector("#wind").textContent = `${formatNumber(current.wind_speed_10m)} km/h`;

  if (current.time) {
    const [date, time] = current.time.split("T");
    document.querySelector("#updatedAt").textContent =
      `Referência: ${formatDate(date, { day: "2-digit", month: "short" })}, ${time}`;
  } else {
    document.querySelector("#updatedAt").textContent = "";
  }
}

function renderForecast(weather) {
  const daily = weather.daily;
  const grid = document.querySelector("#forecastGrid");
  grid.replaceChildren();

  daily.time.forEach((date, index) => {
    const info = getWeatherInfo(daily.weather_code[index]);
    const card = document.createElement("article");
    card.className = "forecast-card";

    const day = document.createElement("p");
    day.className = "forecast-day";
    day.textContent = index === 0
      ? "Hoje"
      : formatDate(date, { weekday: "short", day: "2-digit", month: "2-digit" });

    const icon = document.createElement("span");
    icon.className = "forecast-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = info.icon;

    const description = document.createElement("p");
    description.className = "forecast-description";
    description.textContent = info.label;

    const temperatures = document.createElement("div");
    temperatures.className = "forecast-temps";

    const max = document.createElement("strong");
    max.textContent = `${formatNumber(daily.temperature_2m_max[index])}°`;

    const min = document.createElement("span");
    min.textContent = `${formatNumber(daily.temperature_2m_min[index])}°`;

    temperatures.append(max, min);

    const rain = document.createElement("p");
    rain.className = "forecast-rain";
    const probability = daily.precipitation_probability_max?.[index];
    rain.textContent = probability == null
      ? `Chuva: ${formatNumber(daily.precipitation_sum?.[index], 1)} mm`
      : `🌧 ${formatNumber(probability)}% de chance`;

    card.append(day, icon, description, temperatures, rain);
    grid.append(card);
  });
}

cepInput.addEventListener("input", () => {
  const digits = cepInput.value.replace(/\D/g, "").slice(0, 8);
  cepInput.value = digits.length > 5
    ? `${digits.slice(0, 5)}-${digits.slice(5)}`
    : digits;
});

cepForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const cep = cepInput.value.replace(/\D/g, "");

  if (!/^\d{8}$/.test(cep)) {
    results.hidden = true;
    setStatus("Informe um CEP válido com 8 números.", "error");
    cepInput.focus();
    return;
  }

  setLoading(true);
  results.hidden = true;
  setStatus("Consultando o endereço e os dados meteorológicos...");

  try {
    const address = await getAddressByCep(cep);
    const latitude = Number(address.lat);
    const longitude = Number(address.lng);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new Error("As coordenadas retornadas para este CEP são inválidas.");
    }

    const weather = await getWeather(latitude, longitude);

    if (!weather.current || !weather.daily) {
      throw new Error("A API de clima não retornou todos os dados esperados.");
    }

    renderAddress(address);
    renderCurrent(weather);
    renderForecast(weather);
    results.hidden = false;
    setStatus("Consulta realizada com sucesso.", "success");
  } catch (error) {
    console.error("Erro ao consultar CEP/clima:", error);
    setStatus(
      error instanceof TypeError
        ? "Não foi possível acessar uma das APIs. Verifique sua conexão e tente novamente."
        : error.message || "Ocorreu um erro inesperado. Tente novamente.",
      "error"
    );
  } finally {
    setLoading(false);
  }
});

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const isDark = theme === "dark";
  themeIcon.textContent = isDark ? "☀️" : "🌙";
  themeLabel.textContent = isDark ? "Tema claro" : "Tema escuro";
  themeToggle.setAttribute("aria-label", isDark ? "Ativar tema claro" : "Ativar tema escuro");

  try {
    localStorage.setItem("consulta-brasil-theme", theme);
  } catch {
    // O site continua funcionando mesmo se o navegador bloquear o armazenamento.
  }
}

themeToggle.addEventListener("click", () => {
  const currentTheme = document.documentElement.dataset.theme || "light";
  applyTheme(currentTheme === "light" ? "dark" : "light");
});

try {
  const savedTheme = localStorage.getItem("consulta-brasil-theme");
  const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  applyTheme(savedTheme || preferredTheme);
} catch {
  applyTheme("light");
}
