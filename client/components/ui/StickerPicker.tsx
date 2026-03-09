import React, { useState } from "react";

// Sticker pack definitions
const STICKER_PACKS = [
    {
        id: "smileys",
        label: "😊",
        name: "Smileys",
        stickers: [
            { id: "smileys_happy", label: "Happy" },
            { id: "smileys_love", label: "Love" },
            { id: "smileys_laughing", label: "Laughing" },
            { id: "smileys_cool", label: "Cool" },
            { id: "smileys_sad", label: "Sad" },
            { id: "smileys_angry", label: "Angry" },
            { id: "smileys_wink", label: "Wink" },
            { id: "smileys_thinking", label: "Thinking" },
        ],
    },
    {
        id: "hearts",
        label: "❤️",
        name: "Hearts",
        stickers: [
            { id: "hearts_red", label: "Red Heart" },
            { id: "hearts_broken", label: "Broken Heart" },
            { id: "hearts_sparkling", label: "Sparkling Heart" },
            { id: "hearts_growing", label: "Growing Heart" },
            { id: "hearts_fire", label: "Heart on Fire" },
            { id: "hearts_ribbon", label: "Heart with Ribbon" },
            { id: "hearts_exclaim", label: "Heart Exclamation" },
            { id: "hearts_facelovesmile", label: "Smiling with Hearts" },
        ],
    },
    {
        id: "animals",
        label: "🐾",
        name: "Animals",
        stickers: [
            { id: "animals_cat", label: "Cat" },
            { id: "animals_dog", label: "Dog" },
            { id: "animals_bear", label: "Bear" },
            { id: "animals_panda", label: "Panda" },
            { id: "animals_rabbit", label: "Rabbit" },
            { id: "animals_fox", label: "Fox" },
            { id: "animals_unicorn", label: "Unicorn" },
            { id: "animals_owl", label: "Owl" },
        ],
    },
];

/**
 * Returns the public URL for a given sticker ID.
 */
export function getStickerUrl(stickerId: string): string {
    return `/stickers/${stickerId}.svg`;
}

interface StickerPickerProps {
    onSelect: (stickerId: string) => void;
    onClose: () => void;
}

export const StickerPicker: React.FC<StickerPickerProps> = ({
    onSelect,
    onClose,
}) => {
    const [activePackId, setActivePackId] = useState(STICKER_PACKS[0].id);
    const activePack = STICKER_PACKS.find((p) => p.id === activePackId)!;

    return (
        <div className="absolute bottom-4 left-4 w-80 h-96 bg-surface border border-border rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Header */}
            <div className="p-3 bg-surface-hover border-b border-border flex justify-between items-center">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                    Stickers
                </span>
                <button
                    onClick={onClose}
                    className="text-secondary hover:text-text-main text-xs"
                >
                    Close
                </button>
            </div>

            {/* Pack Tabs */}
            <div className="flex border-b border-border bg-surface">
                {STICKER_PACKS.map((pack) => (
                    <button
                        key={pack.id}
                        onClick={() => setActivePackId(pack.id)}
                        className={`flex-1 py-2 text-center text-lg transition-colors relative ${activePackId === pack.id
                            ? "bg-primary/10"
                            : "hover:bg-surface-hover"
                            }`}
                        title={pack.name}
                    >
                        {pack.label}
                        {activePackId === pack.id && (
                            <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* Sticker Grid */}
            <div className="flex-1 overflow-y-auto p-2 grid grid-cols-4 gap-1 custom-scrollbar bg-surface">
                {activePack.stickers.map((sticker) => (
                    <button
                        key={sticker.id}
                        onClick={() => onSelect(sticker.id)}
                        className="w-full aspect-square flex items-center justify-center p-1.5 hover:bg-surface-hover rounded-xl transition-all hover:scale-110 active:scale-95 group"
                        title={sticker.label}
                    >
                        <img
                            src={getStickerUrl(sticker.id)}
                            alt={sticker.label}
                            className="w-full h-full object-contain drop-shadow-sm group-hover:drop-shadow-md transition-all"
                            loading="lazy"
                        />
                    </button>
                ))}
            </div>

            {/* Footer */}
            <div className="p-2 bg-surface-hover border-t border-border">
                <div className="text-[10px] text-center text-secondary">
                    {activePack.name} Sticker Pack
                </div>
            </div>
        </div>
    );
};
