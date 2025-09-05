import { useEffect, useState } from "react";

export function useRappelsLogic(commercial) {
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

    const playAlert = () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            console.log('Son joué');
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('Impossible de jouer le son:', error);
            if (window.Notification && Notification.permission === "granted") {
                new Notification("🔔 Mode Rappels", { body: "Activé", silent: false });
            }
        }
    };

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

        if (fupTime <= now) return 100;

        const totalDuration = fupTime - startTime;

        const elapsed = now - startTime;

        return Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
    };

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
        let commercialId = commercial?.id;
        console.log("Commercial ID sélectionné:", commercialId);
        try {
            const result = await window.electronAPI.openExternal(url);
            if (result && result.error) {
                console.error("Erreur ouverture URL:", result.error);
            }
        } catch (e) {
            console.error("Erreur openExternal:", e);
        }
        try {
            window.electronAPI.invoke('declare-treatment', { nextFupId: nextFup.id, urlInterraction: apiurl, commercialId: commercialId });
        } catch (error) {
            console.error("Erreur déclaration traitement:", error);
        }
        // On passe au suivant en recalculant depuis la liste existante
        const remainingFups = allFups.filter(f => f.id !== nextFup.id);
        setAllFups(remainingFups);
        loadNextFup(remainingFups);

        if (syncManager) {
            syncManager.broadcastFUPTreated(nextFup.id);
        }
    };

    const onReportFup = async (minutes) => {
        if (!nextFup) return;

        try {
            const currentDate = new Date(nextFup.date);
            const newDate = new Date(currentDate.getTime() + (minutes * 60 * 1000));

            const updatedFup = { ...nextFup, date: newDate.toISOString() };
            setNextFup(updatedFup);

            const updatedFups = allFups.map(f =>
                f.id === nextFup.id ? updatedFup : f
            );
            setAllFups(updatedFups);
            loadNextFup(updatedFups);

            setShowReportPopup(false);

            console.log(`FUP reporté de ${minutes} minutes`);

        } catch (error) {
            console.error("Erreur lors du report:", error);
        }
    };

    return {
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
    };
}
