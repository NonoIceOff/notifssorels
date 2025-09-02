import React from "react";
import { Phone, BookA } from 'lucide-react';

export default function RappelsDetails({ nextFup, truncateNotes }) {
    return (
        <>
            

            {/* Notes cliquables */}
            <div
                style={{
                    margin: 0,
                    fontSize: 11,
                    color: "#ccc",
                    textAlign: "justify",
                    cursor: nextFup.fields?.["Notes"] && nextFup.fields["Notes"].replace("Etablir devis. Notes client : ", "").length > 100 ? "pointer" : "default",
                    padding: 0,
                    borderRadius: 4,
                    minWidth: 300,
                    width: "auto",
                    maxWidth: 400,
                    maxHeight: 20,
                    transition: "background 0.2s ease"
                }}
                onMouseEnter={(e) => {
                    if (nextFup.fields?.["Notes"] && nextFup.fields["Notes"].replace("Etablir devis. Notes client : ", "").length > 100) {
                        e.target.style.background = "rgba(255,255,255,0.05)";
                    }
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = "transparent";
                }}
                onClick={() => {
                    if (nextFup.fields?.["Notes"] && nextFup.fields["Notes"].replace("Etablir devis. Notes client : ", "").length > 100) {
                        // Ouvre une nouvelle fenêtre avec les notes complètes
                        if (window.electronAPI && window.electronAPI.invoke) {
                            window.electronAPI.invoke('open-notes-window', {
                                title: `Notes - ${nextFup.fields?.["Nom client"] || "Client"}`,
                                notes: nextFup.fields["Notes"].replace("Etablir devis. Notes client : ", "")
                            });
                        }
                    }
                }}
            >
                {nextFup.fields?.["Notes"] ? `« ${truncateNotes(nextFup.fields["Notes"], 100)} »` : "Pas de note"}
                {nextFup.fields?.["Notes"] && nextFup.fields["Notes"].replace("Etablir devis. Notes client : ", "").length > 100 && (
                    <span style={{ color: "#60a5fa", marginLeft: 4, fontSize: 10 }}>👁️</span>
                )}
            </div>
        </>
    );
}
