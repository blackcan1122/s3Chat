import React, { useState, useEffect } from "react";


function EmojiDrawer({ isOpen, onEmojiSelect, slicedEmojiList, onNext, onSpecific, OnPrevious, currentPage, maxPages }) {

    function blobs() {
        return Array.from({ length: maxPages }, (_, page) => (
            <span
            key={page}
            onClick={() => {
                if (page !== currentPage) {
                onSpecific(page);
                }
            }}
            className={`Bubble${page === currentPage ? " active" : ""}`}
            />
        ));
    }

return (
    <div
        className={`emoji-drawer ${isOpen ? "open" : ""}`}
        onMouseDown={e => e.preventDefault()}
        style={{ userSelect: "none" }}
    >
        <div className="emoji-list">
            {slicedEmojiList.map((emoji, idx) => (
                <span
                    key={idx}
                    className="emoji"
                    onClick={() => onEmojiSelect(emoji)}
                    style={{
                        cursor: "pointer",
                        fontSize: "1.5rem",
                        margin: "4px",
                        userSelect: "none"
                    }}
                >
                    {emoji}
                </span>
            ))}
        </div>
        <div className="emoji-drawer-header">
            <button className="prev-page" onClick={OnPrevious}>&#60;---</button>
            <span>{blobs()}</span>
            <button className="next-page" onClick={onNext}>---&#62;</button>
        </div>
    </div>
);
}

export default EmojiDrawer;