import React from "react";
import CommercialSelector from "./CommercialSelector.jsx";
import { SquareMinus, SquarePlus, AlarmClock, Clock, LayoutDashboard } from 'lucide-react';
import { Phone, BookA } from 'lucide-react';

export default function RappelsHeader({
    nextFup,
    isExpanded,
    setIsExpanded,
    setShowReportPopup,
    onBack,
    commercial,
    commerciaux = [],
    onSelectCommercial
}) {
    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 0,
            paddingBottom: 4,
            height: 16,
            maxHeight: 16
        }}>
            <button
                style={{
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    opacity: 0.6,
                }}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                {isExpanded ?
                    <SquareMinus color="#ffffffff" size={16} /> :
                    <SquarePlus color="#ffffffff" size={16} />
                }
            </button>
            

            {/* étendu */}
            {isExpanded && (
                <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "center" }}>
                    {/* Commercial tout à gauche */}
                    <div style={{ minWidth: 120, textAlign: "left" }}>
                        {commercial && commercial.nom ? (
                            <p style={{fontSize: 10}}>Commercial : {commercial.nom}</p>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{fontSize: 10, color: '#ff9500'}}>Commercial :</span>
                                <CommercialSelector commerciaux={commerciaux} onSelect={onSelectCommercial} />
                            </div>
                        )}
                    </div>
                    {/* Infos client centrées */}
                    <div style={{
                        fontSize: 11,
                        fontFamily: "Arial, sans-serif",
                        opacity: 0.8,
                        color: "#ccc",
                        display: "flex",
                        flexDirection: "row",
                        alignContent: "center",
                        gap: "4vw",
                        flex: 1,
                        justifyContent: "center"
                    }}>
                        |
                        <p style={{ fontWeight: 800, color: "#ffffffff", fontSize: 12 }}>{nextFup.fields?.["Nom client"] || "Client"} </p>
                        |
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "1vw" }}>
                            <BookA size={12} color="#0099ffff" strokeWidth={3} />
                            <p style={{ fontWeight: 800, color: "#0099ffff", fontSize: 12 }}>{nextFup.source}</p>
                        </div>
                        |
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "1vw" }}>
                            <Phone size={12} color="#ffffffff" strokeWidth={3} />
                            <p style={{ fontWeight: 800, color: "#ffffffff", fontSize: 12 }}>{nextFup.fields?.["Téléphone"] || "Numéro inconnu"} </p>
                        </div>
                        |
                    </div>
                </div>
            )}

            {/* replié */}
            {!isExpanded && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "70%" }}>
                    <div style={{
                        fontSize: 11,
                        fontFamily: "Arial, sans-serif",
                        opacity: 0.8,
                        color: "#ccc",
                        fontWeight: 600,
                    }}>
                        {nextFup.fields?.["Nom client"] || "Client"}
                    </div>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 3,
                        padding: "0px 0",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#aaa"
                    }}>
                        <AlarmClock color="#ff0909ff" size={12} strokeWidth={3} />
                        <p>
                            {new Date(nextFup.date).toLocaleTimeString("fr-FR", {
                                hour: "2-digit", minute: "2-digit", hour12: false,
                            }).replace(":", "h")}
                        </p>
                    </div>
                </div>
            )}

            <div style={{ display: "flex", gap: 4 }}>
                <button
                    style={{
                        background: "transparent",
                        border: "none",
                        padding: 2,
                        cursor: "pointer",
                        opacity: 0.6,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                    onClick={() => setShowReportPopup(true)}
                >
                    <Clock color="#ff9500ff" size={16} strokeWidth={2} />
                </button>

                <button
                    style={{
                        background: "transparent",
                        border: "none",
                        padding: 2,
                        cursor: "pointer",
                        opacity: 0.6,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                    onClick={() => { if (typeof onBack === "function") onBack(); }}
                >
                    <LayoutDashboard color="#0385ffff" size={16} strokeWidth={2} />
                </button>
            </div>
        </div>
    );
}
