import React, { useEffect, useState } from "react";

const cell = {
  padding: "10px",
  borderBottom: "1px solid rgba(148,163,184,.25)",
  textAlign: "left"
};

function fmt(value) {
  if (value == null) return "";
  const n = Number(value);
  return Number.isFinite(n)
    ? n.toLocaleString("pt-BR", { maximumFractionDigits: 6 })
    : "";
}

export default function RabbitMarketsLive() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function refresh() {
      try {
        const response = await fetch(
          "http://127.0.0.1:8766/api/live",
          { cache: "no-store" }
        );
        if (!response.ok) throw Error("HTTP " + response.status);
        const value = await response.json();
        if (alive) {
          setData(value);
          setError("");
        }
      } catch (err) {
        if (alive) setError(String(err.message || err));
      }
    }
    refresh();
    const timer = setInterval(refresh, 15000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  // Only expose the private development API on a local preview.
  if (
    typeof window === "undefined" ||
    !["localhost", "127.0.0.1"].includes(window.location.hostname)
  ) return null;

  const entries = Object.entries(data?.currencies || {});
  const agreed = entries.filter(
    ([, q]) => q.status === "TWO_SOURCES_AGREE"
  ).length;

  return (
    <section style={{
      margin: "24px 0",
      padding: 22,
      border: "1px solid rgba(148,163,184,.4)",
      borderRadius: 16
    }}>
      <h2> Rabbit Global Markets  Live FX</h2>
      <p>
        20 moedas  {agreed}/19 pares com duas fontes concordantes
         atualiza??o autom?tica a cada 60 segundos
      </p>
      <p style={{fontSize:13, opacity:.8}}>
        Cota??o indicativa de mercado. Mint desabilitado.
      </p>

      {error && <p style={{color:"#ef4444"}}>API: {error}</p>}
      {!data && !error && <p>Carregando mercado...</p>}

      {data && (
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%", borderCollapse:"collapse"}}>
            <thead>
              <tr>
                {["Moeda", "1 USD =", "Valida??o", "Fontes", "Hora (Bras?lia)"].map(x =>
                  <th key={x} style={cell}>{x}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {entries.sort(([a],[b]) => a.localeCompare(b)).map(([code, q]) => {
                const sources = q.sources || [];
                const last = sources.length
                  ? Math.min(...sources.map(s => Number(s.observedAt)))
                  : null;
                const status =
                  q.displayStatus === "SOURCE_DELAYED" ? "Fonte atrasada" :
                  q.status === "TWO_SOURCES_AGREE" ? "2 fontes OK" :
                  q.status === "SINGLE_SOURCE_ONLY" ? "1 fonte" :
                  q.status === "USD_IDENTITY" ? "Refer?ncia" :
                  q.status === "PRICE_DIVERGENCE" ? "Diverg?ncia" :
                  "Indispon?vel";

                return (
                  <tr key={code}>
                    <td style={cell}><strong>{code}</strong></td>
                    <td style={cell}>{fmt(q.marketPrice)}</td>
                    <td style={cell}>{status}</td>
                    <td style={cell}>{sources.map(s => s.provider).join(" + ") || ""}</td>
                    <td style={cell}>
                      {last
                        ? new Date(last * 1000).toLocaleString(
                            "pt-BR", {timeZone:"America/Sao_Paulo"}
                          )
                        : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
