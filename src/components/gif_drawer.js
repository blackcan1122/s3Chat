import React, { useState, useEffect } from "react";


function GifDrawer({ isOpen, onGifClick, slicedEmojiList, onNext, onSpecific, OnPrevious, currentPage, maxPages }) {
    const [fetchedGifs, setFetchedGifs] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [nextTokens, setNextTokens] = useState([]);

    // Debounce utility
    function debounce(fn, delay) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    }

    // Debounced fetch_gifs
    const fetch_gifs = React.useCallback(
        debounce(async (search_term) => {
            if (search_term.length < 3) {
                setFetchedGifs(null);
                return;
            }
            setNextTokens([]); // clearing the nextTokens array for a new query
            const response = await fetch(`/api/search_gifs?search_term=${encodeURIComponent(search_term)}&next_token=${encodeURIComponent(null)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${process.env.REACT_APP_API_TOKEN}`
                },
            });
            if (response.ok) {
                let respo = await response.json();
                setFetchedGifs(respo);
                setSearchTerm(search_term);
                setNextTokens(prev => [
                    ...prev, respo.next
                ])
            }
        }, 400), []);

    const LoadNextGifs = React.useCallback(
        debounce(async (search_term) =>{
            if (search_term.length < 3) {
                setFetchedGifs(null);
                return;
            }

            const response = await fetch(`/api/search_gifs?search_term=${encodeURIComponent(search_term)}&next_token=${encodeURIComponent(nextTokens.at(-1))}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${process.env.REACT_APP_API_TOKEN}`
                },
            });

            if (response.ok) {
                let respo = await response.json();
                setFetchedGifs(prev => ({
                    ...respo,
                    results: [...(prev?.results || []), ...(respo.results || [])]
                }));
                setNextTokens(prev => [
                    ...prev, respo.next
                ])
            }
        }, 400), [nextTokens]);

    return(
        <>
        <input placeholder="Search" onChange={(e) => {
            fetch_gifs(e.target.value)
             }} />

        {fetchedGifs && Array.isArray(fetchedGifs.results) && (
            <div
                className="gif-drawer"
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginTop: "12px",
                    justifyContent: "space-between",
                    }}
                    >
                        {fetchedGifs.results.map((gif, idx) => {
                            const maxWidth = 256;
                            const maxHeight = 256;
                            const [origW, origH] = gif.media_formats.gif.dims;
                            let width = origW;
                            let height = origH;
                            const widthRatio = maxWidth / origW;
                            const heightRatio = maxHeight / origH;
                            const ratio = Math.min(widthRatio, heightRatio, 1);
                            width = Math.round(origW * ratio);
                            height = Math.round(origH * ratio);
                            return (
                                <>
                                    <img
                                        key={idx}
                                        src={gif.media_formats.gif.url}
                                        alt={gif.title || gif.content_description || "gif"}
                                        style={{
                                            width: `${width}px`,
                                            height: `${height}px`,
                                            objectFit: "cover",
                                            cursor: "pointer",
                                            borderRadius: "6px", // Optional: slightly round corners for a softer look
                                        }}
                                        onClick={() => onGifClick(gif)}
                                    />
                                </>
                            );
                        })}
            </div>
        )}
        <button className="full-sized" style={{ marginTop: "10px" }} onClick={() => LoadNextGifs(searchTerm)}>Load More</button>

        </>
    )
}

export default GifDrawer;