import React, { useState, useEffect } from "react";
import { API } from "aws-amplify";
import styles from "./search.module.css";

export default function Search() {
  const [searchString, setSearchString] = useState("");
  const [notes, setNotes] = useState([]);
  useEffect(() => {
    (async function onLoad() {
      try {
        const notes = await loadNotes();
        setNotes(notes);
      } catch (e) {
        // handle error
      }
    })();
  }, []);

  function loadNotes() {
    return API.get("notes", "/notes");
  }

  function searchNotes(searchString) {
    const filteredNotes = notes.filter(note =>
      note.content.includes(searchString)
    );

    console.log(filteredNotes);
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Search..."
        value={searchString}
        onChange={e => setSearchString(e.target.value)}
        className={styles.input}
      />
      <button onClick={() => searchNotes(searchString)}>Go!</button>
    </div>
  );
}
