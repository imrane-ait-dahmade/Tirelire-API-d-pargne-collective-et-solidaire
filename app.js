import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
const app = express();
import apiRoutes from './routes/api.js';


import mongoose from 'mongoose';



mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('connecter'))
    .catch(e => console.log('error', e))
const JWT = process.env.JWT_key;
app.use(express.json())
app.use('/', apiRoutes);

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log('HELLO WOLRD ', PORT);
})