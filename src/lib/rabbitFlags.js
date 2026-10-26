const FLAG_MAP = {
  AED: "ae",
  ARS: "ar",
  AUD: "au",
  BRL: "br",
  CAD: "ca",
  CHF: "ch",
  CNY: "cn",
  EUR: "eu",
  GBP: "gb",
  INR: "in",
  JPY: "jp",
  KRW: "kr",
  MXN: "mx",
  NZD: "nz",
  RUB: "ru",
  SAR: "sa",
  SGD: "sg",
  TRY: "tr",
  USD: "us",
  ZAR: "za",
}

export function getFlagUrl(currency) {
  const code = FLAG_MAP[String(currency || "").toUpperCase()]
  return code ? `https://flagcdn.com/w40/${code}.png` : null
}
