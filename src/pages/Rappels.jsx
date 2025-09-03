import React, { useEffect } from "react";
import { useRappelsLogic } from "../components/Rappels/useRappelsLogic.js";
import { useRappelsEffects } from "../components/Rappels/useRappelsEffects.js";
import RappelsLoadingState, { RappelsEmptyState } from "../components/Rappels/RappelsLoadingState.jsx";
import RappelsHeader from "../components/Rappels/RappelsHeader.jsx";
import RappelsCountdown from "../components/Rappels/RappelsCountdown.jsx";
import RappelsDetails from "../components/Rappels/RappelsDetails.jsx";
import RappelsActionButton from "../components/Rappels/RappelsActionButton.jsx";
import RappelsNavigation from "../components/Rappels/RappelsNavigation.jsx";
import RappelsReportPopup from "../components/Rappels/RappelsReportPopup.jsx";

export default function Rappels({ commercial, onBack }) {
    const rappelsState = useRappelsLogic(commercial);

    const {
        nextFup,
        currentFupIndex,
        countdown,
        err,
        loading,
        isVisible,
        notificationSent,
        allFups,
        sortedFups,
        syncManager,
        buttonHovered,
        isExpanded,
        showReportPopup,
        fupStartTime,
        hoveredFup,

        setNextFup,
        setCurrentFupIndex,
        setCountdown,
        setErr,
        setLoading,
        setIsVisible,
        setNotificationSent,
        setAllFups,
        setSortedFups,
        setSyncManager,
        setButtonHovered,
        setIsExpanded,
        setShowReportPopup,
        setFupStartTime,
        setHoveredFup,

        loadNextFup,
        navigateToFup,
        getPreviousFup,
        getNextFup,
        playAlert,
        truncateNotes,
        getProgressPercentage,
        onValidation,
        onReportFup
    } = rappelsState;

    useRappelsEffects({
        setSyncManager,
        syncManager,
        setAllFups,
        loadNextFup,
        setErr,
        setLoading,
        playAlert,
        nextFup,
        setCountdown,
        notificationSent,
        setNotificationSent
    });

    // redimensionner la fenêtre dynamiquement selon l'état expanded/collapsed
    useEffect(() => {
        const baseWidth = isExpanded ? 1032 : 400;
        const baseHeight = isExpanded ? 140 : 64;

        if (window?.electron?.ipcRenderer) {
            window.electron.ipcRenderer.send("set-window-size", { 
                width: baseWidth, 
                height: baseHeight 
            });
        } else if (window?.electronAPI?.setWindowSize) {
            window.electronAPI.setWindowSize({ 
                width: baseWidth, 
                height: baseHeight 
            });
        }
    }, [isExpanded]);

    if (!isVisible) return null;
    console.log("Commercial", commercial?.id);

    return (
        <div style={{
            position: "fixed", left: 16, top: 16, zIndex: 9999,
            width: isExpanded ? 1000 : 332, maxHeight: isExpanded ? 140 : 64,
            background: "rgba(0,0,0,0.8)",
            color: "white", padding: 8,
            borderRadius: 8, fontFamily: "Arial, sans-serif",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.05)",
            overflow: "hidden"
        }}>
            <RappelsLoadingState loading={loading} err={err} onBack={onBack} />

            {!loading && !err && (
                <>
                    {nextFup ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <RappelsHeader
                                nextFup={nextFup}
                                isExpanded={isExpanded}
                                setIsExpanded={setIsExpanded}
                                setShowReportPopup={setShowReportPopup}
                                onBack={onBack}
                            />

                            {/* repliable */}
                            {isExpanded && (
                                <>
                                    <div style={{ display: "flex", flexDirection: "row", gap: 16, justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                                        {/* gauche (précédent) */}
                                        <RappelsNavigation
                                            side="left"
                                            sortedFups={sortedFups}
                                            currentFupIndex={currentFupIndex}
                                            getPreviousFup={getPreviousFup}
                                            getNextFup={getNextFup}
                                            navigateToFup={navigateToFup}
                                            hoveredFup={hoveredFup}
                                            setHoveredFup={setHoveredFup} />

                                        {/* centre */}
                                        <div style={{ display: "flex", flexDirection: "row", gap: 16, justifyContent: "space-between", flex: 1 }}>
                                            <RappelsCountdown
                                                nextFup={nextFup}
                                                countdown={countdown}
                                                getProgressPercentage={getProgressPercentage} />

                                            <RappelsDetails
                                                nextFup={nextFup}
                                                truncateNotes={truncateNotes} />

                                            <RappelsActionButton
                                                buttonHovered={buttonHovered}
                                                setButtonHovered={setButtonHovered}
                                                onValidation={onValidation}
                                                nextFup={nextFup}
                                                onBack={onBack} />
                                        </div>

                                        {/* droite (suivant) */}
                                        <RappelsNavigation
                                            side="right"
                                            sortedFups={sortedFups}
                                            currentFupIndex={currentFupIndex}
                                            getPreviousFup={getPreviousFup}
                                            getNextFup={getNextFup}
                                            navigateToFup={navigateToFup}
                                            hoveredFup={hoveredFup}
                                            setHoveredFup={setHoveredFup} />
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <RappelsEmptyState onBack={onBack} />
                    )}


                </>
            )}

            <RappelsReportPopup
                showReportPopup={showReportPopup}
                onReportFup={onReportFup}
                setShowReportPopup={setShowReportPopup}
            />

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
