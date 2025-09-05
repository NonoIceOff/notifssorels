import React from "react";

export default function CommercialSelector({ commerciaux, onSelect }) {
    return (
        <select
            style={{ fontSize: 12, padding: 2, borderRadius: 4, border: '1px solid #ccc', background: '#222', color: '#fff' }}
            onChange={e => {
                const id = e.target.value;
                const selected = commerciaux.find(c => c.id === id);
                if (selected) onSelect(selected);
            }}
            defaultValue=""
        >
            <option value="" disabled>Choisir un commercial...</option>
            {commerciaux.map(c => (
                <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
        </select>
    );
}
