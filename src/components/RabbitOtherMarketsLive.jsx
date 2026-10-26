import React, { useEffect, useState } from "react";

const fmt = value => {
  if (value == null) return "";
  const n = Number(value);
  return Number.isFinite(n)
    ? n.toLocaleString("pt-BR", {
        maximumFractionDigits: 4
      })
    : "";
};

const cell = {
  padding: "11px 9px",
  textAlign: "left",
  borderBottom: "1px solid rgba(148,163,184,.25)"
};

export default function RabbitOtherMarketsLive() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!["localhost", "127.0.0.1"].includes(
      window.location.hostname
    )) return;

    let active = true;

    async function refresh() {
      try {
        const response = await fetch(
          "http://127.0.0.1:8767/api/markets",
          { cache: "no-store" }
        );
        if (!response.ok) throw Error("HTTP " + response.status);
        const json = await response.json();
        if (active) {
          setData(json);
          setError("");
        }
      } catch (e) {
        if (active) setError(String(e.message || e));
      }
    }

    refresh();
    const timer = setInterval(refresh, 30000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  if (
    typeof window === "undefined" ||
    !["localhost", "127.0.0.1"].includes(
      window.location.hostname
    )
  ) return null;

  const groups = [
    ["METAL", "Metais preciosos"],
    ["ENERGY", "Energia"],
    ["INDEX", "?ndices"],
    ["EQUITY", "A??es"]
  ];

  const assets = data?.assets || {};

  return (
    <section style={{
      padding: 22,
      margin: "24px 0",
      border: "1px solid rgba(148,163,184,.4)",
      borderRadius: 16
    }}>
      <h2> Rabbit Global Markets  Commodities & Stocks</h2>
      <p style={{fontSize:13, opacity:.75}}>
        Dez ativos adicionais  Testnet  Fontes gratuitas
         pre?os indicativos  nenhuma emiss?o autorizada
      </p>

      {error && (
        <p role="alert" style={{color:"#e55"}}>
          Fonte indispon?vel: {error}
        </p>
      )}

      {!data && !error && <p>Consultando os mercados...</p>}

      {groups.map(([category, label]) => {
        const entries = Object.values(assets).filter(
          a => a.category === category
        );

        if (!entries.length) return null;

        return (
          <div key={category} style={{marginTop:22}}>
            <h3>{label}</h3>
            <div style={{overflowX:"auto"}}>
              <table style={{
                width:"100%",
                borderCollapse:"collapse",
                fontSize:13
              }}>
                <thead>
                  <tr>
                    {["Ativo","Pre?o","Instrumento","Estado","Observa??o"].map(h =>
                      <th style={cell} key={h}>{h}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {entries.map(a => {
                    const age = a.observedAt
                      ? Math.floor(Date.now()/1000 - a.observedAt)
                      : null;

                    const status = age == null
                      ? "Indispon?vel"
                      : age > 900
                        ? "?ltimo pre?o / mercado fechado ou atrasado"
                        : age > 300
                          ? "Cota??o atrasada"
                          : "Cota??o recente";

                    return (
                      <tr key={a.code}>
                        <td style={cell}><strong>{a.code}</strong></td>
                        <td style={cell}>
                          {fmt(a.price)}
                          <small> {a.unit}</small>
                        </td>
                        <td style={cell}>{a.instrumentType}</td>
                        <td style={cell}>{status}</td>
                        <td style={cell}>
                          {a.observedAt
                            ? new Date(a.observedAt*1000).toLocaleString(
                                "pt-BR",
                                {timeZone:"America/Sao_Paulo"}
                              )
                            : "Sem hor?rio"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </section>
  );
}
