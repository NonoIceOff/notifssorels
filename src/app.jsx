import React, { useEffect, useState } from "react";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Rappels from "./pages/Rappels.jsx";

function App() {
    const [data, setData] = useState(null);
    const [err, setErr] = useState("");
    const [page, setPage] = useState("rappels");
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        let width = 232;
        let height = 332;
        if (page === "dashboard") {
            width = 600;
            height = 1000;
        } 
        if (page === "rappels") {
            width = 280;
            height = 232;
        }
        if (window?.electron?.ipcRenderer) {
            window.electron.ipcRenderer.send("set-window-size", { width, height });
        } else if (window?.electronAPI?.setWindowSize) {
            window.electronAPI.setWindowSize({ width, height });
        }
    }, [page]);

    useEffect(() => {
        // Vérifier si plus de 10 minutes se sont écoulées
        if (page === "rappels") {
            if (window?.electron?.ipcRenderer) {
                console.log("Envoi check-10-minutes");
                window.electron.ipcRenderer.send("check-10-minutes");
            }
        }
    }, [page]);

    // Gestionnaires d'événements pour le system tray
    useEffect(() => {
        const handleGoToHome = () => {
            setPage("home");
        };

        const handleDisableRappelMode = () => {
            setPage("home");
        };

        if (window?.electronAPI?.onTrayAction) {
            window.electronAPI.onTrayAction('go-to-home', handleGoToHome);
            window.electronAPI.onTrayAction('disable-rappel-mode', handleDisableRappelMode);
        } else if (window?.electron?.ipcRenderer) {
            window.electron.ipcRenderer.on('go-to-home', handleGoToHome);
            window.electron.ipcRenderer.on('disable-rappel-mode', handleDisableRappelMode);
        }

        return () => {
            if (window?.electron?.ipcRenderer) {
                window.electron.ipcRenderer.removeListener('go-to-home', handleGoToHome);
                window.electron.ipcRenderer.removeListener('disable-rappel-mode', handleDisableRappelMode);
            }
        };
    }, []);

    console.log("Rendu App", { page, selected });

    return (
        <>
            {page === "home" && (
                <Home
                    data={data}
                    err={err}
                    onSelect={(rec) => {
                        setSelected(rec);
                        console.log("Commercial sélectionné :", rec);
                        setPage("dashboard");
                    }}
                    onRappels={() => setPage("rappels")}
                />
            )}
            {page === "dashboard" && (
                <Dashboard commercial={selected} onBack={() => setPage("home")} />
            )}
            {page === "rappels" && <Rappels onBack={() => setPage("home")} />}
        </>
    );
}

export default App;
