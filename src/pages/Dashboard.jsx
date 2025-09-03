import React, { useEffect, useState } from "react";
import { Phone, Clock } from "lucide-react";

export default function Dashboard({ commercial, onBack }) {
    const [allFups, setAllFups] = useState([]);
    const [err, setErr] = useState("");
    const [commerciaux, setCommerciaux] = useState([]);
    const [selected, setSelected] = useState(commercial);

    const onValidation = async (fup) => {
        console.log("Validation en cours...");
        let url;
        let apiurl;
        if (fup?.source === "Borne") {
            url = `https://airtable.com/appFeaGqAHejv7iLp/tblgprO8dgROULLrI/${fup.fields?.["recordId_client"]}`;
            apiurl = `https://api.airtable.com/v0/appFeaGqAHejv7iLp/tbly1gjmFN7G1z14y/${fup.id}`;
        } else {
            url = `https://airtable.com/appdqWTPlSySyDboC/tblHSte1gYJhkdFUB/${fup.fields?.["recordId_client"]}`;
            apiurl = `https://api.airtable.com/v0/appdqWTPlSySyDboC/tblWhxRcecJC0r0E4/${fup.id}`;
        }
        // ouverture de la fiche client
        try {
            const result = await window.electronAPI.openExternal(url);
            if (result && result.error) {
                console.error("Erreur ouverture URL:", result.error);
            }
        } catch (e) {
            console.error("Erreur openExternal:", e);
        }
        // déclaration de traitement sur airtable
        try {
            window.electronAPI.invoke('declare-treatment', { nextFupId: fup.id, urlInterraction: apiurl });
        } catch (error) {
            console.error("Erreur déclaration traitement:", error);
        }
        // supprime le FUP traité de la liste
        setAllFups(currentFups => currentFups.filter(f => f.id !== fup.id));
    };

    // fetch commerciaux via IPC sécurisé
    useEffect(() => {
        (async () => {
            try {
                let commerciauxData = [];
                if (window?.electronAPI?.invoke) {
                    commerciauxData = await window.electronAPI.invoke('get-commerciaux');
                }
                if (commerciauxData && commerciauxData.error) throw new Error(commerciauxData.error);
                commerciauxData = Array.isArray(commerciauxData) ? commerciauxData : [];
                setCommerciaux(commerciauxData);
            } catch (e) {
                setErr("Erreur chargement commerciaux: " + e.message);
            }
        })();
    }, []);

    // fetch FUPs via IPC sécurisé
    useEffect(() => {
        (async () => {
            try {
                let records = [];
                if (window?.electronAPI?.invoke) {
                    records = await window.electronAPI.invoke('get-fups');
                }
                if (records && records.error) throw new Error(records.error);
                records = Array.isArray(records) ? records : [];
                records = records.filter(r => r.date);
                records.sort((a, b) => new Date(a.date) - new Date(b.date));
                setAllFups(records);
            } catch (e) {
                setErr("Erreur chargement FUP: " + e.message);
            }
        })();
    }, []);

    return (
        <div style={{ background: "rgba(0,0,0,0.92)", color: "white", borderRadius: 12, padding: 12, minWidth: 220 }}>
            <div style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 8, height: 32 }}>
                    <button
                        className="clickable"
                        style={{ WebkitAppRegion: "no-drag", fontWeight: 600, borderRadius: 6, border: "none", background: "#fff", color: "#222", padding: "2px 6px", cursor: "pointer", height: 32 }}
                        onClick={onBack}
                    >
                        &larr; Retour
                    </button>
                    <p style={{ fontFamily: "Arial, sans-serif", alignContent: "center" }}>En tant que {selected?.fields["Prénom"] || "Commercial inconnu"}</p>
                </div>
                <h3 style={{ margin: 0, fontFamily: "Arial, sans-serif" }}>Les FUP restants</h3>
            </div>
            
            {err && <p style={{ color: "#ff6b6b" }}>{err}</p>}
            <div
                style={{
                    maxHeight: 600,
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
                <ul style={{ padding: 0, margin: 0, width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
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
                                    <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
                                        <span
                                            style={{
                                                color: "#ff4d4d",
                                                fontSize: 11,
                                                fontWeight: 500,
                                                fontFamily: "Arial, sans-serif",
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "4px",
                                                width: "100%"
                                            }}
                                        >
                                            <div>
                                                <Clock size={12} />{" "}
                                                <p style={{ fontWeight: 900, display: "inline" }}>
                                                    {new Date(rawDate).toLocaleTimeString("fr-FR", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                            </div>
                                            <p style={{ margin: 0 }}>{rec.fields["Nom client"]} ({rec.sourceEmoji})</p>
                                        </span>
                                        <span
                                            style={{
                                                color: "#ffffffff",
                                                fontSize: 11,
                                                fontWeight: 600,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "4px"
                                            }}
                                        >
                                            <Phone size={12} /> <p style={{fontFamily: "Arial, sans-serif"}}>{rec.fields["Téléphone"]}</p>
                                        </span>
                                        <button
                                            style={{
                                                WebkitAppRegion: "no-drag",
                                                fontWeight: 600,
                                                borderRadius: 4,
                                                border: "none",
                                                background: "linear-gradient(135deg, #b91010ff 0%, #960505ff 100%)",
                                                color: "#fff",
                                                padding: "4px 8px",
                                                cursor: "pointer",
                                                fontSize: 10,
                                                transition: "all 0.2s ease"
                                            }}
                                            onClick={() => onValidation(rec)}
                                            onMouseEnter={(e) => {
                                                e.target.style.background = "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)";
                                                e.target.style.transform = "translateY(-1px)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.background = "linear-gradient(135deg, #b91010ff 0%, #960505ff 100%)";
                                                e.target.style.transform = "translateY(0)";
                                            }}
                                        >
                                            Je vais traiter ce FUP
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
                                        <span
                                            style={{
                                                color: "#1dfa00ff",
                                                fontSize: 11,
                                                fontWeight: 500,
                                                fontFamily: "Arial, sans-serif",
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "4px",
                                                width: "100%"
                                            }}
                                        >
                                            <div>
                                                <p style={{ fontWeight: 900, display: "inline" }}>
                                                    {new Date(rawDate).toLocaleTimeString("fr-FR", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                            </div>
                                            <p style={{ margin: 0 }}>{rec.fields["Nom client"]} ({rec.sourceEmoji})</p>
                                        </span>
                                        <span
                                            style={{
                                                color: "#ffffffff",
                                                fontSize: 11,
                                                fontWeight: 600,
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "4px"
                                            }}
                                        >
                                            <Phone size={12} /> <p style={{fontFamily: "Arial, sans-serif"}}>{rec.fields["Téléphone"]}</p>
                                        </span>
                                        <button
                                            style={{
                                                WebkitAppRegion: "no-drag",
                                                fontWeight: 600,
                                                borderRadius: 4,
                                                border: "none",
                                                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                                color: "#fff",
                                                padding: "4px 8px",
                                                cursor: "pointer",
                                                fontSize: 10,
                                                transition: "all 0.2s ease"
                                            }}
                                            onClick={() => onValidation(rec)}
                                            onMouseEnter={(e) => {
                                                e.target.style.background = "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)";
                                                e.target.style.transform = "translateY(-1px)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
                                                e.target.style.transform = "translateY(0)";
                                            }}
                                        >
                                            Je vais traiter ce FUP
                                        </button>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}

