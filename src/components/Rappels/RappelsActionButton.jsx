import React from "react";
import { CircleCheckBig, SquareArrowOutUpRight } from 'lucide-react';

export default function RappelsActionButton({ buttonHovered, setButtonHovered, onValidation, nextFup, onBack }) {
    return (
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
            justifyContent: "space-between",
            gap: 6,
            boxShadow: buttonHovered
                ? "0 4px 12px rgba(59,130,246,0.4)"
                : "0 2px 6px rgba(16,185,129,0.3)",
            transform: buttonHovered ? "translateY(-1px)" : "translateY(0)",
            width: 170
        }}
            onMouseEnter={() => setButtonHovered(true)}
            onMouseLeave={() => setButtonHovered(false)}
            onClick={() => { if (typeof onBack === "function") onValidation(nextFup.fields?.["recordId_client"]); }}>


            {buttonHovered ? <SquareArrowOutUpRight color="#ffffffff" size={16} strokeWidth={4} /> : <CircleCheckBig color="#ffffffff" size={16} strokeWidth={4} />}
            <span>{buttonHovered ? "Fiche client" : "Je vais traiter"}</span>
        </button>
    );
}
