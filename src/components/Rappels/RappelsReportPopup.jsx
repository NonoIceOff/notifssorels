import React from "react";

export default function RappelsReportPopup({ showReportPopup, onReportFup, setShowReportPopup }) {
    if (!showReportPopup) return null;

    return (
        <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.9)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            borderRadius: 8,
            padding: 12
        }}>
            <div style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#fff",
                marginBottom: 8,
                textAlign: "center"
            }}>
                Reporter le FUP
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
                {/* Avancer */}
                <div style={{
                    fontSize: 11,
                    color: "#10b981",
                    fontWeight: 600,
                    marginBottom: 2
                }}>
                    Avancer :
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                    <button
                        style={{
                            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            border: "none",
                            borderRadius: 4,
                            color: "#fff",
                            padding: "4px 8px",
                            fontSize: 10,
                            cursor: "pointer",
                            flex: 1
                        }}
                        onClick={() => onReportFup(-15)}
                    >
                        -15min
                    </button>
                    <button
                        style={{
                            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            border: "none",
                            borderRadius: 4,
                            color: "#fff",
                            padding: "4px 8px",
                            fontSize: 10,
                            cursor: "pointer",
                            flex: 1
                        }}
                        onClick={() => onReportFup(-30)}
                    >
                        -30min
                    </button>
                </div>

                {/* Reporter */}
                <div style={{
                    fontSize: 11,
                    color: "#f59e0b",
                    fontWeight: 600,
                    marginBottom: 2,
                    marginTop: 8
                }}>
                    Reporter :
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                    <button
                        style={{
                            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                            border: "none",
                            borderRadius: 4,
                            color: "#fff",
                            padding: "4px 8px",
                            fontSize: 10,
                            cursor: "pointer",
                            flex: 1
                        }}
                        onClick={() => onReportFup(15)}
                    >
                        +15min
                    </button>
                    <button
                        style={{
                            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                            border: "none",
                            borderRadius: 4,
                            color: "#fff",
                            padding: "4px 8px",
                            fontSize: 10,
                            cursor: "pointer",
                            flex: 1
                        }}
                        onClick={() => onReportFup(30)}
                    >
                        +30min
                    </button>
                    <button
                        style={{
                            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                            border: "none",
                            borderRadius: 4,
                            color: "#fff",
                            padding: "4px 8px",
                            fontSize: 10,
                            cursor: "pointer",
                            flex: 1
                        }}
                        onClick={() => onReportFup(60)}
                    >
                        +1h
                    </button>
                </div>
            </div>

            <button
                style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: 4,
                    color: "#aaa",
                    padding: "4px 12px",
                    fontSize: 10,
                    cursor: "pointer",
                    marginTop: 8
                }}
                onClick={() => setShowReportPopup(false)}
            >
                Annuler
            </button>
        </div>
    );
}
