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
            setNextTokens([]); // clear offsets for new query
            const response = await fetch(`/api/search_gifs?search_term=${encodeURIComponent(search_term)}&offset=0`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${process.env.REACT_APP_API_TOKEN}`
                },
            });
            if (response.ok) {
                let respo = await response.json();
                // Giphy: respo.data is the array, respo.pagination.next_offset for pagination
                setFetchedGifs({
                    results: respo.data,
                    next: respo.pagination?.offset + respo.pagination?.count
                });
                setSearchTerm(search_term);
                setNextTokens([respo.pagination?.offset + respo.pagination?.count || 0]);
            }
        }, 400), []);

    const LoadNextGifs = React.useCallback(
        debounce(async (search_term) => {
            if (search_term.length < 3) {
                setFetchedGifs(null);
                return;
            }

            // Use the current number of loaded gifs as the offset
            const currentOffset = fetchedGifs?.results?.length || 0;
            const response = await fetch(`/api/search_gifs?search_term=${encodeURIComponent(search_term)}&offset=${encodeURIComponent(currentOffset)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': `Bearer ${process.env.REACT_APP_API_TOKEN}`
                },
            });

            if (response.ok) {
                let respo = await response.json();
                setFetchedGifs(prev => ({
                    ...prev,
                    results: [...(prev?.results || []), ...(respo.data || [])],
                    next: respo.pagination?.offset + respo.pagination?.count
                }));
                setNextTokens(prev => [
                    ...prev, respo.pagination?.offset + respo.pagination?.count
                ])
            }
        }, 400), [fetchedGifs, searchTerm]);

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
                            // Giphy: use gif.images.original for url, width, height
                            const maxWidth = 256;
                            const maxHeight = 256;
                            const origW = parseInt(gif.images.original.width, 10);
                            const origH = parseInt(gif.images.original.height, 10);
                            let width = origW;
                            let height = origH;
                            const widthRatio = maxWidth / origW;
                            const heightRatio = maxHeight / origH;
                            const ratio = Math.min(widthRatio, heightRatio, 1);
                            width = Math.round(origW * ratio);
                            height = Math.round(origH * ratio);
                            return (
                                <img
                                    key={gif.id}
                                    src={gif.images.original.url}
                                    alt={gif.title || gif.slug || "gif"}
                                    style={{
                                        width: `${width}px`,
                                        height: `${height}px`,
                                        objectFit: "cover",
                                        cursor: "pointer",
                                        borderRadius: "6px",
                                    }}
                                    onClick={() => onGifClick(gif)}
                                />
                            );
                        })}
            </div>
        )}
        <button className="full-sized" style={{ marginTop: "10px" }} onClick={() => LoadNextGifs(searchTerm)}>Load More</button>
        <div className="powered-by-giphy"><img src="imgs/PoweredBy_200px-Black_HorizLogo.png" /></div>

        </>
    )
}

export default GifDrawer;