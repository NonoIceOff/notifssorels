
import React, { useEffect, useState } from "react";
import axios from "axios";

import Dashboard from "./Dashboard.jsx";

const AIRTABLE_BASE = "appFeaGqAHejv7iLp";
const AIRTABLE_TABLE = "tbl88zJhSHXTUfsUv";
const AIRTABLE_PAT = "patZthA3gTAMyiwHA.a6eae1969fdd5e39de9a533caf133941c8e23e8c974e3bd87a710f6ecd4cc75a";

export default function App() {
    const [data, setData] = useState(null);
    const [err, setErr] = useState("");
    const [page, setPage] = useState("home");
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_TABLE}`;
                const res = await axios.get(url, {
                    headers: { Authorization: `Bearer ${AIRTABLE_PAT}` }
                });
                console.log("data", res.data);
                setData(res.data); // on stocke tout tel quel
            } catch (e) {
                console.log(e.message);
                setErr(e.message);
            }
        })();
    }, []);

    console.log("data", data);

    return (
        <div
            style={{
                position: "fixed",
                left: 16,
                bottom: 16,
                zIndex: 9999,
                background: "rgba(0,0,0,0.9)",
                color: "white",
                padding: 8,
                borderRadius: 12,
                fontFamily: "system-ui, Arial, sans-serif",
                WebkitAppRegion: "drag",
                boxShadow: "0 4px 24px 0 rgba(0,0,0,0.25)",
                height: 368,
                width: 180,
            }}
        >
            {page === "home" && (
                <>
                    <h3 style={{ margin: 0 }}>Qui êtes-vous ?</h3>
                    {err && (
                        <p style={{ color: "#ff6b6b", marginTop: 1, WebkitAppRegion: "no-drag" }}>
                            Erreur: {err}
                        </p>
                    )}
                    <ul style={{ marginTop: 10, paddingLeft: 16, WebkitAppRegion: "no-drag" }}>
                        {data &&
                            data.records.map((rec) => (
                                <li key={rec.id} style={{ listStyle: "none", marginBottom: 6 }}>
                                    <button
                                        style={{
                                            cursor: "pointer",
                                            padding: "6px 16px",
                                            borderRadius: 6,
                                            border: "none",
                                            background: "#fff",
                                            color: "#222",
                                            fontWeight: 600,
                                            fontSize: 16,
                                            WebkitAppRegion: "no-drag"
                                        }}
                                        onClick={() => {
                                            setSelected(rec);
                                            setPage("dashboard");
                                        }}
                                    >
                                        {rec.fields["Prénom"]}
                                    </button>
                                </li>
                            ))}
                    </ul>
                </>
            )}
            {page === "dashboard" && (
                <Dashboard commercial={selected} onBack={() => setPage("home")} />
            )}
        </div>
    );
}
