import React from "react";
import { SquareArrowLeft, SquareArrowRight, Phone, BookA } from 'lucide-react';

export default function RappelsNavigation({
    side, // "left" ou "right"
    sortedFups,
    currentFupIndex,
    getPreviousFup,
    getNextFup,
    navigateToFup,
    hoveredFup,
    setHoveredFup
}) {
    if (sortedFups.length <= 1) return null;

    // Affichage de la navigation gauche (précédent)
    if (side === "left") {
        return (
            <div style={{
                display: "flex",
                alignItems: "center",
                minWidth: 100,
            }}>
                {/* FUP Précédent */}
                <div
                    style={{
                        cursor: getPreviousFup() ? "pointer" : "default",
                        opacity: getPreviousFup() ? 1 : 0.3,
                        transition: "all 0.2s ease",
                        position: "relative",
                    }}
                    onClick={() => {
                        const prevFup = getPreviousFup();
                        if (prevFup) {
                            navigateToFup(currentFupIndex - 1);
                        }
                    }}
                    onMouseEnter={(e) => {
                        if (getPreviousFup()) {
                            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                            setHoveredFup('prev');
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        setHoveredFup(null);
                    }}
                >
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "2px 4px",
                        borderRadius: 4,
                        textAlign: "left"
                    }}>
                        <SquareArrowLeft size={12} color="#ccc" />
                        <div style={{ display: "flex", flexDirection: "column", minWidth: 0, alignItems: "flex-start", justifyContent: "flex-start", textAlign: "left" }}>
                            {getPreviousFup() ? (
                                <>
                                    <div style={{
                                        fontSize: 10,
                                        color: "#ccc",
                                        fontWeight: 600,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        textAlign: "left",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 0

                                    }}>
                                        <p style={{ padding: 0, margin: 0 }}>{getPreviousFup().fields?.["Nom client"] || "Client"}</p>
                                        <p style={{ padding: 0, margin: 0, color: "#888" }}>{new Date(getPreviousFup().date).toLocaleTimeString("fr-FR", {
                                            hour: "2-digit", minute: "2-digit"
                                        })}</p>

                                    </div>
                                </>
                            ) : (
                                <div style={{ fontSize: 9, color: "#555" }}>Aucun</div>
                            )}
                        </div>
                    </div>

                    {/* Tooltip précédent */}
                    {hoveredFup === 'prev' && getPreviousFup() && (
                        <div style={{
                            position: "absolute",
                            bottom: "100%",
                            left: 0,
                            background: "rgba(0,0,0,0.95)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: 6,
                            padding: 8,
                            fontSize: 10,
                            color: "#fff",
                            zIndex: 1000,
                            minWidth: 120,
                            marginBottom: 4
                        }}>
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>
                                {getPreviousFup().fields?.["Nom client"]}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                                <Phone size={10} />
                                <span>{getPreviousFup().fields?.["Téléphone"] || "N/A"}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <BookA size={10} />
                                <span>{getPreviousFup().source || "N/A"}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Affichage de la navigation droite (suivant)
    if (side === "right") {
        return (
            <div style={{
                display: "flex",
                alignItems: "center",
                minWidth: 100,
                justifyContent: "flex-end",
            }}>
                {/* FUP Suivant */}
                <div
                    style={{
                        display: "flex",
                        cursor: getNextFup() ? "pointer" : "default",
                        opacity: getNextFup() ? 1 : 0.3,
                        transition: "all 0.2s ease",
                        position: "relative",
                        justifyContent: "flex-end",
                    }}
                    onClick={() => {
                        const nextFupItem = getNextFup();
                        if (nextFupItem) {
                            navigateToFup(currentFupIndex + 1);
                        }
                    }}
                    onMouseEnter={(e) => {
                        if (getNextFup()) {
                            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                            setHoveredFup('next');
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        setHoveredFup(null);
                    }}
                >
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "2px 4px",
                        borderRadius: 4,
                        textAlign: "right"
                    }}>
                        <div style={{ display: "flex", flexDirection: "column", minWidth: 0, alignItems: "flex-end", justifyContent: "flex-end", textAlign: "right" }}>
                            {getNextFup() ? (
                                <>
                                    <div style={{
                                        fontSize: 10,
                                        color: "#ccc",
                                        fontWeight: 600,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        textAlign: "right",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 0
                                    }}>
                                        <p style={{ padding: 0, margin: 0 }}>{getNextFup().fields?.["Nom client"] || "Client"}</p>
                                        <p style={{ padding: 0, margin: 0, color: "#888" }}>{new Date(getNextFup().date).toLocaleTimeString("fr-FR", {
                                            hour: "2-digit", minute: "2-digit"
                                        })}</p>
                                    </div>

                                </>
                            ) : (
                                <div style={{ fontSize: 9, color: "#555", textAlign: "right" }}>Aucun</div>
                            )}
                        </div>
                        <SquareArrowRight size={12} color="#ccc" />
                    </div>

                    {/* Tooltip suivant */}
                    {hoveredFup === 'next' && getNextFup() && (
                        <div style={{
                            position: "absolute",
                            bottom: "100%",
                            right: 0,
                            background: "rgba(0,0,0,0.95)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: 6,
                            padding: 8,
                            fontSize: 10,
                            color: "#fff",
                            zIndex: 1000,
                            minWidth: 120,
                            marginBottom: 4
                        }}>
                            <div style={{ fontWeight: 600, marginBottom: 4 }}>
                                {getNextFup().fields?.["Nom client"]}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                                <Phone size={10} />
                                <span>{getNextFup().fields?.["Téléphone"] || "N/A"}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                <BookA size={10} />
                                <span>{getNextFup().source || "N/A"}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Fallback : affichage d'un indicateur simple au centre
    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "4px 8px",
        }}>
            <div style={{
                fontSize: 9,
                color: "#666",
                fontWeight: 600,
            }}>
                {currentFupIndex + 1} / {sortedFups.length}
            </div>
        </div>
    );
}
