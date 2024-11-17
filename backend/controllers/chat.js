import db from '../database/database.js';
import { queryLLM } from '../services/llm.js';


export const queryChat = async (req, res) => {
    const { query } = req.body;
    console.log('\n--- New Query Request ---');
    console.log('User Query:', query);

    if (!query) {
        console.log('Error: Query is missing');
        return res.status(400).json({ error: 'Query is missing' });
    }

    try {
        const generatedSql = await queryLLM(query);
        console.log('Generated SQL:', generatedSql);

        if (generatedSql === 'Invalid Query') {
            console.log('Error: Invalid query based on schema');
            return res.status(400).json({ error: 'Invalid query based on the schema' });
        }

        db.all(generatedSql, [], (err, rows) => {
            if (err) {
                console.error('Error executing generated SQL:', err);
                return res.status(500).json({ error: 'Failed to execute generated SQL' });
            }

            // console.log('Query Results:', JSON.stringify(rows, null, 2));

            db.run(
                'INSERT INTO chat_history (user_id, user_text, bot_text) VALUES (?, ?, ?)',
                [req.user.user_id, query, JSON.stringify(rows)],
                function (insertErr) {
                    if (insertErr) {
                        console.error('Error inserting chat history:', insertErr);
                    }
                }
            );

            res.json({ sql_result: rows });
        });
    } catch (error) {
        console.error('LLM Error:', error);
        res.status(500).json({ error: 'Failed to generate SQL query from LLM' });
    }
}

export const getChatHistory = (req, res) => {
    db.all(
        'SELECT user_text, bot_text, timestamp FROM chat_history WHERE user_id = ? ORDER BY timestamp ASC',
        [req.user.user_id],
        (err, rows) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching chat history' });
            }
            res.json(rows);
        }
    );
}