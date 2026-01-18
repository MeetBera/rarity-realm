// server.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001; // Running on a different port than your React app

app.use(cors());
app.use(bodyParser.json());

// Path to your JSON file
const DATA_FILE = path.join(__dirname, 'src', 'data', 'cards.json');

app.post('/add-card', (req, res) => {
    const newCardData = req.body;

    // 1. Read existing file
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading file');
        }

        let cards = [];
        try {
            cards = JSON.parse(data);
        } catch (e) {
            console.error("JSON Parse error", e);
        }

        // 2. Auto-generate ID (Take last ID + 1)
        const lastId = cards.length > 0 ? cards[cards.length - 1].id : 0;
        const newCard = {
            id: lastId + 1,
            ...newCardData
        };

        // 3. Add to array
        cards.push(newCard);

        // 4. Write back to file
        fs.writeFile(DATA_FILE, JSON.stringify(cards, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error writing file');
            }
            res.json({ message: 'Card added successfully!', card: newCard });
        });
    });
});

app.listen(PORT, () => {
    console.log(`File-writer server running on http://localhost:${PORT}`);
});