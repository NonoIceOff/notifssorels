import React, { useEffect, useState } from "react";
import axios from "axios";

const AIRTABLE_BASE = "appFeaGqAHejv7iLp";
const AIRTABLE_TABLE = "tbly1gjmFN7G1z14y";
const AIRTABLE_BASEB = "appdqWTPlSySyDboC";
const AIRTABLE_TABLEB = "tblWhxRcecJC0r0E4";
const AIRTABLE_PAT = "patZthA3gTAMyiwHA.a6eae1969fdd5e39de9a533caf133941c8e23e8c974e3bd87a710f6ecd4cc75a";


export default function Dashboard({ commercial, onBack }) {
    if (!commercial) return null;

    const [allFups, setAllFups] = useState([]);
    const [err, setErr] = useState("");

    useEffect(() => {
        (async () => {
            try {
                // URLs
                const urlBornes = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_TABLE}?view=viwYSQHhIhDSCxjWa&filterByFormula=NOT({FUP%20INTERRACTION%20}='')&sort[0][field]=FUP%20INTERRACTION%20&sort[0][direction]=asc`;
                const urlBat = `https://api.airtable.com/v0/${AIRTABLE_BASEB}/${AIRTABLE_TABLEB}?view=viwnZpTSlapB9TP42&filterByFormula=NOT({FUP%20Interraction}='')&sort[0][field]=FUP%20Interraction&sort[0][direction]=asc`;

                // Requêtes en parallèle
                const [resBornes, resBat] = await Promise.all([
                    axios.get(urlBornes, { headers: { Authorization: `Bearer ${AIRTABLE_PAT}` } }),
                    axios.get(urlBat, { headers: { Authorization: `Bearer ${AIRTABLE_PAT}` } }),
                ]);

                // Concatène et trie
                const records = [
                    ...resBornes.data.records.map((r) => ({
                        ...r,
                        date: r.fields["FUP INTERRACTION "],
                        source: "Borne",
                    })),
                    ...resBat.data.records.map((r) => ({
                        ...r,
                        date: r.fields["FUP Interraction"],
                        source: "Batterie/Panneau",
                    })),
                ].filter(r => r.date); // garde que ceux avec une date

                records.sort((a, b) => new Date(a.date) - new Date(b.date));

                setAllFups(records);
            } catch (e) {
                console.error(e.message);
                setErr(e.message);
            }
        })();
    }, []);

    return (
        <>
            <h3 style={{ margin: 0 }}>Dashboard de {commercial.fields["Prénom"]}</h3>
            <button
                style={{ margin: "1px 0", WebkitAppRegion: "no-drag" }}
                onClick={onBack}
            >
                &larr; Retour
            </button>

            {err && <p style={{ color: "red" }}>{err}</p>}

            <div
                style={{
                    maxHeight: 260,
                    minHeight: 120,
                    overflowY: "auto",
                    overflowX: "hidden",
                    margin: "10px 0 0 0",
                    width: "100%",
                    background: "transparent",
                    scrollbarWidth: "thin",
                    WebkitAppRegion: "no-drag",
                }}
            >
                <p>FUP RDV (Bornes + Batteries/Panneaux)</p>
                <ul style={{ padding: 0, margin: 0, width: "100%" }}>
                    {allFups.map((rec) => {
                        const rawDate = rec.date;
                        let formattedDate = rawDate;
                        let isPast = false;

                        if (rawDate) {
                            const d = new Date(rawDate);
                            formattedDate = d.toLocaleDateString("fr-FR", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                            });
                            isPast = d < new Date(Date.now() - 15 * 60 * 1000);
                        }

                        return (
                            <li
                                key={rec.id}
                                style={{
                                    listStyle: "none",
                                    marginBottom: isPast ? 6 : 16,
                                    background: isPast ? "transparent" : "rgba(255,255,255,0.08)",
                                    borderRadius: 8,
                                    padding: isPast ? "2px" : "4px",
                                    boxShadow: isPast
                                        ? "none"
                                        : "0 2px 8px 0 rgba(0,0,0,0.10)",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                }}
                            >
                                {isPast ? (
                                    <>
                                        <span
                                            style={{
                                                color: "#ff4d4d",
                                                fontSize: 11,
                                                fontWeight: 600,
                                            }}
                                        >
                                            ⏱{" "}
                                            {new Date(rawDate).toLocaleTimeString("fr-FR", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}{" "}
                                            - {rec.fields["Nom client"]} ({rec.source})
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span
                                            style={{
                                                color: "#1dfa00ff",
                                                fontSize: 11,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {new Date(rawDate).toLocaleTimeString("fr-FR", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}{" "}
                                            - {rec.fields["Nom client"]} ({rec.source})
                                        </span>
                                        <span
                                            style={{
                                                color: "#ffffffff",
                                                fontSize: 11,
                                                fontWeight: 600,
                                            }}
                                        >
                                            (☎️ {rec.fields["Téléphone"]})
                                        </span>
                                    </>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </>
    );
}
