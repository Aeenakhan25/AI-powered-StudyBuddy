const Note = require('../models/Note');

exports.getNotes = async (req, res) => {
    try {
        const notes = await Note.findAllByUserId(req.user.id);
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getNoteById = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id, req.user.id);
        if (!note) return res.status(404).json({ error: 'Note not found' });
        res.json(note);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createNote = async (req, res) => {
    const { title, content, folder } = req.body;
    try {
        const noteId = await Note.create(req.user.id, title || 'Untitled Note', content || '', folder || 'General');
        res.status(201).json({ id: noteId, title, content, folder });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateNote = async (req, res) => {
    const { title, content, folder } = req.body;
    try {
        await Note.update(req.params.id, req.user.id, title, content, folder);
        res.json({ message: 'Note updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteNote = async (req, res) => {
    try {
        await Note.delete(req.params.id, req.user.id);
        res.json({ message: 'Note deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
