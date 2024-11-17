import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { errorHandlerReqRes, errorHandler } from './middleware/error.js';
import  chatRouter  from './routes/chat.js';
import  usersRouter  from './routes/users.js';



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

//error handling middleware
app.use(errorHandlerReqRes);
app.use(errorHandler);

//routes
app.use('/api/users', usersRouter);
app.use('/api/chat', chatRouter);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
