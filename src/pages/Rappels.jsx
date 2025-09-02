import React, { useEffect, useState } from "react";
import { SquareMinus, SquarePlus, LayoutDashboard, CalendarClock, Phone, CircleCheckBig, BookA, AlarmClock, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Rappels({ onBack }) {
    const [nextFup, setNextFup] = useState(null);
    const [currentFupIndex, setCurrentFupIndex] = useState(0);
    const [countdown, setCountdown] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(true);
    const [notificationSent, setNotificationSent] = useState(false);
    const [allFups, setAllFups] = useState([]);
    const [sortedFups, setSortedFups] = useState([]);
    const [syncManager, setSyncManager] = useState(null);
    const [buttonHovered, setButtonHovered] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [showReportPopup, setShowReportPopup] = useState(false);
    const [fupStartTime, setFupStartTime] = useState(null);
    const [hoveredFup, setHoveredFup] = useState(null);

    const loadNextFup = (fupsList) => {
        const now = new Date();
        const sorted = fupsList
            .map((r) => ({ ...r, d: new Date(r.date) }))
            .sort((a, b) => a.d - b.d);
        
        setSortedFups(sorted);
        
        // Trouve le prochain FUP (premier non passé)
        const nextIndex = sorted.findIndex(fup => fup.d > now);
        
        if (nextIndex !== -1) {
            setCurrentFupIndex(nextIndex);
            const currentFup = sorted[nextIndex];
            
            // Si c'est un nouveau FUP, enregistrer le moment de début
            if (!nextFup || currentFup.id !== nextFup.id) {
                setFupStartTime(now);
            }
            
            setNextFup(currentFup);
        } else if (sorted.length > 0) {
            // Si tous les FUPs sont passés, prendre le dernier
            setCurrentFupIndex(sorted.length - 1);
            setNextFup(sorted[sorted.length - 1]);
        } else {
            setCurrentFupIndex(0);
            setNextFup(null);
        }
    };

    const navigateToFup = (index) => {
        if (index >= 0 && index < sortedFups.length) {
            setCurrentFupIndex(index);
            setNextFup(sortedFups[index]);
            // Reset le temps de début pour le nouveau FUP sélectionné
            setFupStartTime(new Date());
        }
    };

    const getPreviousFup = () => {
        return currentFupIndex > 0 ? sortedFups[currentFupIndex - 1] : null;
    };

    const getNextFup = () => {
        return currentFupIndex < sortedFups.length - 1 ? sortedFups[currentFupIndex + 1] : null;
    };

    // Initialise WebRTC pour la synchronisation
    useEffect(() => {
        const initWebRTC = async () => {
            try {
                if (window.FUPSyncManager) {
                    const manager = new window.FUPSyncManager();
                    await manager.init((treatedFupId) => {
                        console.log('[WebRTC] FUP traité reçu:', treatedFupId);
                        // Supprime le FUP traité de la liste locale
                        setAllFups(currentFups => {
                            const updatedFups = currentFups.filter(f => f.id !== treatedFupId);
                            loadNextFup(updatedFups);
                            return updatedFups;
                        });
                    });
                    setSyncManager(manager);
                }
            } catch (error) {
                console.log('[WebRTC] Non disponible, mode local uniquement');
            }
        };

        // Essaie d'initialiser WebRTC après un petit délai
        setTimeout(initWebRTC, 1000);

        return () => {
            if (syncManager) {
                syncManager.close();
            }
        };
    }, []);

    const onValidation = async (clientId) => {
        console.log("Validation en cours...");
        let url;
        let apiurl;
        if (nextFup?.source === "Borne") {
            url = `https://airtable.com/appFeaGqAHejv7iLp/tblgprO8dgROULLrI/${clientId}`;
            apiurl = `https://api.airtable.com/v0/appFeaGqAHejv7iLp/tbly1gjmFN7G1z14y/${nextFup.id}`;
        } else {
            url = `https://airtable.com/appdqWTPlSySyDboC/tblHSte1gYJhkdFUB/${clientId}`;
            apiurl = `https://api.airtable.com/v0/appdqWTPlSySyDboC/tblWhxRcecJC0r0E4/${nextFup.id}`;
        }
        // Ouverture de la fiche client
        try {
            const result = await window.electronAPI.openExternal(url);
            if (result && result.error) {
                console.error("Erreur ouverture URL:", result.error);
            }
        } catch (e) {
            console.error("Erreur openExternal:", e);
        }
        // Déclaration de traitement sur airtable
        try {
            window.electronAPI.invoke('declare-treatment', { nextFupId: nextFup.id, urlInterraction: apiurl });
        } catch (error) {
            console.error("Erreur déclaration traitement:", error);
        }
        // On passe au suivant en recalculant depuis la liste existante
        const remainingFups = allFups.filter(f => f.id !== nextFup.id);
        setAllFups(remainingFups);
        loadNextFup(remainingFups);

        // Diffuse via WebRTC que ce FUP a été traité
        if (syncManager) {
            syncManager.broadcastFUPTreated(nextFup.id);
        }
    };

    const onReportFup = async (minutes) => {
        if (!nextFup) return;

        try {
            // Calcule la nouvelle date
            const currentDate = new Date(nextFup.date);
            const newDate = new Date(currentDate.getTime() + (minutes * 60 * 1000));

            // Met à jour localement
            const updatedFup = { ...nextFup, date: newDate.toISOString() };
            setNextFup(updatedFup);

            // Met à jour dans la liste
            const updatedFups = allFups.map(f =>
                f.id === nextFup.id ? updatedFup : f
            );
            setAllFups(updatedFups);
            loadNextFup(updatedFups);

            // Ferme la popup
            setShowReportPopup(false);

            console.log(`FUP reporté de ${minutes} minutes`);

        } catch (error) {
            console.error("Erreur lors du report:", error);
        }
    };

    function playAlert() {
        try {
            // Crée un son simple avec Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            gainNode.gain.setValueAtTime(1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            console.log('Son joué');
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('Impossible de jouer le son:', error);
            // Fallback : utiliser une notification système
            if (window.Notification && Notification.permission === "granted") {
                new Notification("🔔 Mode Rappels", { body: "Activé", silent: false });
            }
        }
    }

    const truncateNotes = (notes, maxLength = 50) => {
        if (!notes) return "N/A";
        const cleanNotes = notes.replace("Etablir devis. Notes client : ", "");
        if (cleanNotes.length <= maxLength) return cleanNotes;
        return cleanNotes.substring(0, maxLength) + "...";
    };

    const getProgressPercentage = () => {
        if (!nextFup || !fupStartTime) return 0;

        const now = new Date();
        const fupTime = new Date(nextFup.date);
        const startTime = new Date(fupStartTime);

        // Si le FUP est passé, 100%
        if (fupTime <= now) return 100;

        // Durée totale entre le moment où le FUP est devenu actif et l'heure du FUP
        const totalDuration = fupTime - startTime;

        // Temps écoulé depuis le début
        const elapsed = now - startTime;

        // Pourcentage basé sur le temps écoulé
        return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
    };


    // ----------------------
    // Récupère les FUPs (une seule fois au montage)
    // ----------------------
    useEffect(() => {
        (async () => {
            try {
                console.log("Récupération FUPs...");
                playAlert();
                let records = [];
                if (window?.electron?.ipcRenderer?.invoke) {
                    records = await window.electron.ipcRenderer.invoke('get-fups');
                } else if (window?.electronAPI?.invoke) {
                    records = await window.electronAPI.invoke('get-fups');
                }
                console.log("FUPs reçus:", records);
                if (records && records.error) throw new Error(records.error);
                records = Array.isArray(records) ? records : [];
                records = records.filter((r) => r.date);
                records.sort((a, b) => new Date(a.date) - new Date(b.date));
                setAllFups(records);
                loadNextFup(records);
            } catch (e) {
                setErr("Erreur chargement FUP: " + e.message);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // ----------------------
    // Countdown + affichage
    // ----------------------
    useEffect(() => {
        if (!nextFup) return;
        const interval = setInterval(() => {
            const now = new Date();
            const target = new Date(nextFup.date);
            const diff = target - now;
            if (diff <= 0) {
                setCountdown("Dépassé");
                playAlert();
                clearInterval(interval);
                return;
            }

            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            const str =
                (h > 0 ? h + ":" : "00:") +
                (m > 0 ? m.toString().padStart(2, "0") + ":" : "00:") +
                s.toString().padStart(2, "0");

            setCountdown(str);

            // Logique affichage fenêtre
            //setIsVisible(diff <= 5 * 60 * 1000);
        }, 1000);

        return () => clearInterval(interval);
    }, [nextFup]);

    // ----------------------
    // Notification unique
    // ----------------------
    useEffect(() => {
        if (!nextFup || notificationSent) return;
        const now = new Date();
        const timeLeft = new Date(nextFup.date) - now;

        if (timeLeft <= 5 * 60 * 1000 && window.Notification) {
            new Notification("Mode Rappel activé", {
                body: "Le prochain rappel est dans moins de 5 minutes.",
            });
            setNotificationSent(true);
        } else if (timeLeft <= 0 && window.Notification) {
            new Notification("Mode Rappel activé", {
                body: `Maintenant: ${nextFup.fields?.["Nom client"] || "Client inconnu"} (${nextFup.source}) à ${nextFup.fields?.["Téléphone"] || "N/A"}`,
            });
        } else {
            new Notification("Mode Rappel activé", {
                body: `Le prochain rappel (${new Date(nextFup.date).toLocaleTimeString("fr-FR", {
                    hour: "2-digit", minute: "2-digit", hour12: false,
                }).replace(":", "h")}) vous sera notifié 5 minutes avant.`,
            });
        }
    }, [nextFup, notificationSent]);

    // ----------------------
    // Rendu
    // ----------------------
    if (!isVisible) return null;

    return (
        <div style={{
            position: "fixed", left: 16, top: 16, zIndex: 9999,
            width: 232, maxHeight: 200,
            background: "rgba(0,0,0,0.8)",
            color: "white", padding: 8,
            borderRadius: 8, fontFamily: "Arial, sans-serif",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.05)",
            overflow: "hidden"
        }}>

            {loading && (
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
            )}

            {err && (
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
            )}

            {!loading && !err && (
                <>
                    {nextFup ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            {/* Header compact */}
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: 0,
                                padding: 4,
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



                                {/* Affichage minimal quand replié */}
                                {isExpanded && (
                                    <div style={{
                                        fontSize: 11,
                                        fontFamily: "Arial, sans-serif",
                                        opacity: 0.8,
                                        color: "#ccc",

                                    }}>
                                        {nextFup.fields?.["Nom client"] || "Client"} {nextFup.sourceEmoji}
                                    </div>
                                )}

                                {/* Affichage minimal quand replié */}
                                {!isExpanded && (
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", width: "100%" }}>
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

                            {/* Contenu repliable */}
                            {isExpanded && (
                                <>
                                    {/* Temps et countdown en une ligne avec progress bar */}
                                    <div style={{
                                        position: "relative",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        borderRadius: 4,
                                        padding: 6,
                                        gap: 8,
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
                                            fontSize: 20,
                                            fontWeight: 900,
                                            color: "#fff",
                                            fontFamily: "monospace",
                                            position: "relative",
                                            zIndex: 1
                                        }}>
                                            {countdown}
                                        </div>
                                    </div>

                                    <div style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        gap: 4
                                    }}>

                                        {/* Téléphone inline */}
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            background: "rgba(255,255,255,0.05)",
                                            borderRadius: 4,
                                            width: "100%",
                                            padding: 6
                                        }}>
                                            <Phone size={12} color="#fff" />
                                            <p style={{ margin: 0, fontSize: 11, color: "#ccc" }}>{nextFup.fields?.["Téléphone"] || "N/A"}</p>
                                        </div>

                                        {/* Type inline */}
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            background: "rgba(255,255,255,0.05)",
                                            borderRadius: 4,
                                            width: "100%",
                                            padding: 6
                                        }}>
                                            <BookA size={12} color="#fff" />
                                            <p style={{ margin: 0, fontSize: 11, color: "#ccc" }}>{nextFup.source || "N/A"}</p>
                                        </div>

                                    </div>

                                    {/* Notes cliquables */}
                                    <div
                                        style={{
                                            margin: 0,
                                            fontSize: 11,
                                            color: "#ccc",
                                            textAlign: "justify",
                                            cursor: nextFup.fields?.["Notes"] && nextFup.fields["Notes"].replace("Etablir devis. Notes client : ", "").length > 50 ? "pointer" : "default",
                                            padding: "4px 0",
                                            borderRadius: 4,
                                            transition: "background 0.2s ease"
                                        }}
                                        onMouseEnter={(e) => {
                                            if (nextFup.fields?.["Notes"] && nextFup.fields["Notes"].replace("Etablir devis. Notes client : ", "").length > 50) {
                                                e.target.style.background = "rgba(255,255,255,0.05)";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = "transparent";
                                        }}
                                        onClick={() => {
                                            if (nextFup.fields?.["Notes"] && nextFup.fields["Notes"].replace("Etablir devis. Notes client : ", "").length > 50) {
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
                                        "{truncateNotes(nextFup.fields?.["Notes"], 50)}"
                                        {nextFup.fields?.["Notes"] && nextFup.fields["Notes"].replace("Etablir devis. Notes client : ", "").length > 50 && (
                                            <span style={{ color: "#60a5fa", marginLeft: 4, fontSize: 10 }}>👁️ [EN VOIR PLUS]</span>
                                        )}
                                    </div>

                                    {/* Bouton avec animation */}
                                    <button style={{
                                        WebkitAppRegion: "no-drag",
                                        fontWeight: 900,
                                        borderRadius: 6,
                                        border: "none",
                                        background: buttonHovered
                                            ? "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)"
                                            : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                        color: "#fff",
                                        padding: "6px 12px",
                                        cursor: "pointer",
                                        fontSize: 11,
                                        transition: "all 0.3s ease",
                                        fontFamily: "Arial, sans-serif",
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 6,
                                        boxShadow: buttonHovered
                                            ? "0 4px 12px rgba(59,130,246,0.4)"
                                            : "0 2px 6px rgba(16,185,129,0.3)",
                                        transform: buttonHovered ? "translateY(-1px)" : "translateY(0)"
                                    }}
                                        onMouseEnter={() => setButtonHovered(true)}
                                        onMouseLeave={() => setButtonHovered(false)}
                                        onClick={() => { if (typeof onBack === "function") onValidation(nextFup.fields?.["recordId_client"]); }}>
                                        <CircleCheckBig color="#ffffffff" size={16} strokeWidth={4} />
                                        <span>{buttonHovered ? "Rediriger vers Fiche client" : "Je vais traiter"}</span>
                                    </button>

                                </>
                            )}


                        </div>
                    ) : (
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
                    )}

                    {/* Bandeau de navigation FUP précédent/suivant */}
                    {sortedFups.length > 1 && (
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 8,
                            marginTop: 8,
                            padding: "4px 0",
                            borderTop: "1px solid rgba(255,255,255,0.1)"
                        }}>
                            {/* FUP Précédent */}
                            <div
                                style={{
                                    flex: 1,
                                    cursor: getPreviousFup() ? "pointer" : "default",
                                    opacity: getPreviousFup() ? 1 : 0.3,
                                    transition: "all 0.2s ease",
                                    position: "relative"
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
                                    borderRadius: 4
                                }}>
                                    <ChevronLeft size={12} color="#ccc" />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        {getPreviousFup() ? (
                                            <>
                                                <div style={{
                                                    fontSize: 9,
                                                    color: "#888",
                                                    fontWeight: 600
                                                }}>
                                                    PRÉCÉDENT
                                                </div>
                                                <div style={{
                                                    fontSize: 10,
                                                    color: "#ccc",
                                                    fontWeight: 600,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap"
                                                }}>
                                                    {new Date(getPreviousFup().date).toLocaleTimeString("fr-FR", {
                                                        hour: "2-digit", minute: "2-digit"
                                                    })} • {getPreviousFup().fields?.["Nom client"] || "Client"}
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

                            {/* Indicateur position */}
                            <div style={{
                                fontSize: 9,
                                color: "#666",
                                fontWeight: 600,
                                padding: "0 8px"
                            }}>
                                {currentFupIndex + 1} / {sortedFups.length}
                            </div>

                            {/* FUP Suivant */}
                            <div
                                style={{
                                    flex: 1,
                                    cursor: getNextFup() ? "pointer" : "default",
                                    opacity: getNextFup() ? 1 : 0.3,
                                    transition: "all 0.2s ease",
                                    position: "relative"
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
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        {getNextFup() ? (
                                            <>
                                                <div style={{
                                                    fontSize: 9,
                                                    color: "#888",
                                                    fontWeight: 600
                                                }}>
                                                    SUIVANT
                                                </div>
                                                <div style={{
                                                    fontSize: 10,
                                                    color: "#ccc",
                                                    fontWeight: 600,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap"
                                                }}>
                                                    {new Date(getNextFup().date).toLocaleTimeString("fr-FR", {
                                                        hour: "2-digit", minute: "2-digit"
                                                    })} • {getNextFup().fields?.["Nom client"] || "Client"}
                                                </div>
                                            </>
                                        ) : (
                                            <div style={{ fontSize: 9, color: "#555" }}>Aucun</div>
                                        )}
                                    </div>
                                    <ChevronRight size={12} color="#ccc" />
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
                    )}
                </>
            )}

            {/* Popup de report */}
            {showReportPopup && (
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
            )}

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
