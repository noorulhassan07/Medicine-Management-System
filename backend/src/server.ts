import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB  from './config/db';
import medicineRoutes from './routes/medicineRoutes';

dotenv.config();


const PORT = process.env.PORT || 5000;
const app = express();


// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));


// Routes
app.use('/api/medicines', medicineRoutes);

// Root
app.get('/', (req, res) => {
res.send({ status: 'ok', message: 'Medicine backend running' });
});


// Start server after DB connected
connectDB()
.then(() => {
app.listen(PORT, () => {
console.log(`Server listening on port ${PORT}`);
});
})
.catch((err) => {
console.error('Failed to connect to DB', err);
process.exit(1);
});