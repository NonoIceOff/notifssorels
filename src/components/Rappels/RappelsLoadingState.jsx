import React from "react";

export default function RappelsLoadingState({ loading, err, onBack }) {
    if (loading) {
        return (
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                color: "#60a5fa",
                padding: "20px 0"
            }}>
                <div style={{
                    width: 14,
                    height: 14,
                    border: "2px solid rgba(96,165,250,0.3)",
                    borderTop: "2px solid #60a5fa",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite"
                }}></div>
                <span style={{ fontSize: 11 }}>Chargement...</span>
            </div>
        );
    }

    if (err) {
        return (
            <div style={{
                color: "#f87171",
                background: "rgba(239,68,68,0.1)",
                padding: 6,
                borderRadius: 6,
                border: "1px solid rgba(239,68,68,0.2)",
                fontSize: 11
            }}>
                {err}
            </div>
        );
    }

    return null;
}

export function RappelsEmptyState({ onBack }) {
    return (
        <div style={{
            textAlign: "center",
            padding: "15px 5px",
            opacity: 0.7
        }}>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 8 }}>
                Aucun FUP
            </div>
            <button
                style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 3,
                    padding: "3px 6px",
                    color: "#aaa",
                    cursor: "pointer",
                    fontSize: 11
                }}
                onClick={() => { if (typeof onBack === "function") onBack(); }}
            >
                ← Retour
            </button>
        </div>
    );
}
