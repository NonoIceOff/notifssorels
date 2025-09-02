import React from "react";
import { CalendarClock } from 'lucide-react';

export default function RappelsCountdown({ nextFup, countdown, getProgressPercentage }) {
    return (
        <div style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: 4,
            padding: 6,
            gap: 8,
            width: 170,
            overflow: "hidden",
            background: "rgba(255,255,255,0.05)"
        }}>
            {/* Progress bar background */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(to right, 
                    ${getProgressPercentage() > 80 ? 'rgba(239,68,68,0.3)' :
                        getProgressPercentage() > 50 ? 'rgba(245,158,11,0.3)' :
                            'rgba(34,197,94,0.3)'} ${getProgressPercentage()}%, 
                    transparent ${getProgressPercentage()}%)`,
                transition: "background 1s ease"
            }}></div>

            {/* Contenu par-dessus la progress bar */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                position: "relative",
                zIndex: 1
            }}>
                <CalendarClock color="#ccc" size={14} />
                <span style={{ fontSize: 11, color: "#ccc", fontWeight: 600 }}>
                    {new Date(nextFup.date).toLocaleTimeString("fr-FR", {
                        hour: "2-digit", minute: "2-digit", hour12: false,
                    }).replace(":", "h")}
                </span>
            </div>

            <div style={{
                fontSize: 14,
                fontWeight: 900,
                color: "#fff",
                fontFamily: "monospace",
                position: "relative",
                zIndex: 1
            }}>
                {countdown}
            </div>
        </div>
    );
}
