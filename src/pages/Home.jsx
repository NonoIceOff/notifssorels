import React, { useEffect, useState } from "react";
import { Bell, SquareUser } from 'lucide-react';

export default function Home({ data, err: errProp, onSelect, onRappels }) {
    const [commerciaux, setCommerciaux] = useState([]);
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (data && data.records) {
            setCommerciaux(data.records);
            setLoading(false);
            return;
        }
        (async () => {
            try {
                setLoading(true);
                let commerciauxData = [];
                if (window?.electronAPI?.invoke) {
                    commerciauxData = await window.electronAPI.invoke('get-commerciaux');
                }
                if (commerciauxData && commerciauxData.error) throw new Error(commerciauxData.error);
                commerciauxData = Array.isArray(commerciauxData) ? commerciauxData : [];
                setCommerciaux(commerciauxData);
            } catch (e) {
                setErr("Erreur chargement commerciaux: " + e.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [data]);


    return (
        <div
            style={{
                position: "fixed",
                left: 16,
                top: 16,
                zIndex: 9999,
                background: "rgba(0,0,0,0.9)",
                color: "white",
                padding: 8,
                borderRadius: 12,
                fontFamily: "system-ui, Arial, sans-serif",
                boxShadow: "0 4px 24px 0 rgba(0,0,0,0.25)",
                height: 300,
                width: 180
            }}
        >
            <div style={{ WebkitAppRegion: "drag", marginBottom: 8 }}>
                <h3 style={{ margin: 0 }}>Qui êtes-vous ?</h3>
            </div>
            {(err || errProp) && (
                <p style={{ color: "#ff6b6b", marginTop: 1, WebkitAppRegion: "no-drag" }}>
                    Erreur: {err || errProp}
                </p>
            )}
            {loading && (
                <p style={{ color: "#4dabf7", marginTop: 1, WebkitAppRegion: "no-drag" }}>
                    Chargement...
                </p>
            )}
            <ul style={{ marginTop: 4, paddingLeft: 4, WebkitAppRegion: "no-drag" }}>
                {commerciaux.map((rec) => (
                    <li key={rec.id} style={{ listStyle: "none", marginBottom: 4 }}>
                        <button
                            style={{
                                cursor: "pointer",
                                padding: "4px 8px",
                                borderRadius: 6,
                                border: "none",
                                background: "#fff",
                                color: "#222",
                                fontWeight: 600,
                                fontSize: 12,
                                WebkitAppRegion: "no-drag"
                            }}
                            onClick={() => onSelect(rec)}
                        >
                            <SquareUser color="#222" size={12} style={{ marginRight: 6 }} />
                            {rec.fields["Prénom"]}
                        </button>
                    </li>
                ))}
            </ul>
            <button
                style={{
                    cursor: "pointer",
                    padding: "6px 16px",
                    borderRadius: 6,
                    border: "none",
                    background: "#1b02ffff",
                    color: "#ffffffff",
                    fontWeight: 600,
                    fontSize: 12,
                    WebkitAppRegion: "no-drag",
                    flexDirection: "row", display: "flex", gap: 6, alignItems: "center", justifyContent: "center", marginTop: 8, width: "100%"
                }}
                onClick={onRappels}
            >
                <Bell color="#fff" size={16} /> MODE RAPPELS
            </button>
        </div>
    );
}
