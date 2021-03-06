import React, { useState, useEffect } from "react";
import { API } from "aws-amplify";
import { Link } from "react-router-dom";
import { BsPencilSquare } from "react-icons/bs";
import ListGroup from "react-bootstrap/ListGroup";
import Spinner from "react-bootstrap/Spinner";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { LinkContainer } from "react-router-bootstrap";
import { useAppContext } from "../libs/contextLib";
import { onError } from "../libs/errorLib";
import "./Home.css";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const { isAuthenticated } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);

  //search
  const [searchString, setSearchString] = useState("");
  const [displayedNotes, setDisplayedNotes] = useState([]);

  // find and replace
  const [replaceModal, setReplaceModal] = useState(false);
  const [findString, setFindString] = useState("");
  const [replaceString, setReplaceString] = useState("");

  useEffect(() => {
    async function onLoad() {
      if (!isAuthenticated) {
        return;
      }

      try {
        const notes = await loadNotes();
        setNotes(notes);
        setDisplayedNotes(notes);
      } catch (e) {
        onError(e);
      }
      setIsLoading(false);
    }

    onLoad();
  }, [isAuthenticated]);

  function loadNotes() {
    return API.get("notes", "/notes");
  }

  function searchNotes(e, searchString) {
    e.preventDefault();

    const filteredNotes = notes.filter(note =>
      note.content.toLowerCase().includes(searchString.toLowerCase())
    );

    setDisplayedNotes(filteredNotes);
  }

  function findAndReplace(find, replace) {
    const replacedNotes = notes.map(note => {
      note.content = note.content.replaceAll(find, replace);
      return note;
    });

    setNotes(replacedNotes);
    setReplaceModal(false);
  }

  function renderModal() {
    return (
      <Modal
        show={() => setReplaceModal(true)}
        onHide={() => setReplaceModal(false)}
      >
        <Modal.Header closeButton className="modal-header">
          <Modal.Title>Find & Replace</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Find (or replace) all notes with any word or phrase. Be careful, there
          is no "undo", and it is case sensitive!
        </Modal.Body>
        <input
          className="replace-input"
          type="text"
          placeholder="Find"
          onChange={e => setFindString(e.target.value)}
        />
        <input
          className="replace-input"
          type="text"
          placeholder="Replace"
          onChange={e => setReplaceString(e.target.value)}
        />
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={() => findAndReplace(findString, replaceString)}
          >
            Replace
          </Button>
          <Button variant="secondary" onClick={() => setReplaceModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  function renderNotesList(notes) {
    return (
      <>
        <LinkContainer to="/notes/new">
          <ListGroup.Item action className="py-3 text-nowrap text-truncate">
            <BsPencilSquare size={17} />
            <span className="ml-2 font-weight-bold">Create a new note</span>
          </ListGroup.Item>
        </LinkContainer>
        {displayedNotes.map(({ noteId, content, createdAt }) => (
          <LinkContainer key={noteId} to={`/notes/${noteId}`}>
            <ListGroup.Item action>
              <span className="font-weight-bold">
                {content.trim().split("\n")[0]}
              </span>
              <br />
              <span className="text-muted">
                Created: {new Date(createdAt).toLocaleString()}
              </span>
            </ListGroup.Item>
          </LinkContainer>
        ))}
      </>
    );
  }

  function renderLander() {
    return (
      <div className="lander">
        <h1>Scratch</h1>
        <p className="text-muted">A simple note taking app</p>
        <div className="pt-3">
          <Link to="/login" className="btn btn-info btn-lg mr-3">
            Login
          </Link>
          <Link to="/signup" className="btn btn-success btn-lg">
            Signup
          </Link>
        </div>
      </div>
    );
  }

  function renderNotes() {
    return (
      <>
        {isLoading ? (
          <div className="note-spinner text-center">
            <Spinner animation="border" variant="secondary" />
          </div>
        ) : (
          <div className="notes">
            <h2 className="pb-3 mt-4 mb-3 border-bottom">Your Notes</h2>
            <ListGroup>{!isLoading && renderNotesList(notes)}</ListGroup>
            <div className="actions">
              <form className="search">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchString}
                  onChange={e => setSearchString(e.target.value)}
                />
                <button onClick={e => searchNotes(e, searchString)}>
                  Enter
                </button>
              </form>
              <button onClick={() => setReplaceModal(true)}>
                Find & Replace Text
              </button>
              {replaceModal && renderModal()}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="Home">
      {isAuthenticated ? renderNotes() : renderLander()}
    </div>
  );
}
