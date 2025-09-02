import { useEffect } from "react";

export function useRappelsEffects({
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
}) {
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

    // Récupère les FUPs (une seule fois au montage)
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

    // Countdown + affichage
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
        }, 1000);

        return () => clearInterval(interval);
    }, [nextFup]);

    // Notification unique
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
}
