import mongoose from 'mongoose';
import chalk from 'chalk';

const connectDB = async () => {
  try {
    // 1. Connection Options (Ache practice ke liye)
    const conn = await mongoose.connect(process.env.MONGO_URI || '');

    console.log(
      chalk.black.bgGreen.bold(`\n ✔ MongoDB Connected: ${conn.connection.host} `)
    );

    // 2. Event Listeners: Agar baad mein connection lose ho jaye
    mongoose.connection.on('error', (err) => {
      console.log(chalk.red.bold(`✖ MongoDB connection error: ${err}`));
    });

    mongoose.connection.on('disconnected', () => {
      console.log(chalk.yellow.bold('⚠ MongoDB disconnected! Check your network.'));
    });

    // Node process band hote waqt connection sahi se close ho
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log(chalk.magenta.bold('\n MongoDB connection closed due to app termination'));
      process.exit(0);
    });

  } 
  catch (error: any) {
    console.log(chalk.white.bgRed.bold('\n ✖ DATABASE CONNECTION FAILED '));
    
    if (error.name === 'MongoParseError') {
      console.log(chalk.red('👉 Check your MONGO_URI format in .env file.'));
    } 
    else if (error.message.includes('ETIMEOUT')) {
      console.log(chalk.red('👉 Connection Timeout! Check your Internet or IP Whitelist in Atlas.'));
    } 
    else {
      console.log(chalk.red(`👉 Error: ${error.message}`));
    }

    process.exit(1);
  }
};

export default connectDB;