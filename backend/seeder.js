import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

import path from 'path';

dotenv.config({ path: path.resolve('backend', '.env') });


const importData = async () => {
    try {
        await connectDB();
        await User.deleteMany();

        await User.create({
            email: 'admin@saqlaincloth.com',
            password: 'password123'
        });

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
