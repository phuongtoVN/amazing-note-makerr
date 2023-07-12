const express = require('express');
const path = require('path');
const termData = require('./db/db.json');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
const fs = require('fs');
const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'))   
});

app.get('/api/notes', (req, res) => res.json(termData));

app.post('/api/notes', (req, res) => {
    console.info(`${req.method} request received to add a review`);

    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
    
        let notes = JSON.parse(data);
    
        // Generate a unique ID for the new note
        const newNoteId = uuidv4();
    
        // Create a new note object
        const newNote = {
          id: newNoteId,
          title: req.body.title,
          text: req.body.text,
        };
    
        // Add the new note to the notes array
        notes.push(newNote);
        console.log(notes)
        // Write the updated notes array back to db.json
        fs.writeFile('./db/db.json', JSON.stringify(notes), (err) => {
          if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
          }
    
          // Send the new note as the response
          res.status(201).json(newNote);
        });
      });
});

app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;
    console.info(`${req.method} request received to add a review`);
    // Read the existing notes from db.json
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      let notes = JSON.parse(data);
  
      // Find the index of the note with the given id
      const noteIndex = notes.findIndex((note) => note.id === noteId);
  
      if (noteIndex === -1) {
        res.status(404).json({ error: 'Note not found' });
        return;
      }
  
      // Remove the note from the notes array
      notes.splice(noteIndex, 1);
  
      // Write the updated notes array back to db.json
      fs.writeFile('./db/db.json', JSON.stringify(notes), (err) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
  
        res.json({ success: true });
      });
    });
  });
  

app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT} 🚀`));