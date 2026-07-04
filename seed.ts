import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User';
import Project from './src/models/Project';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to MongoDB");

    let user = await User.findOne();
    if (!user) {
      user = await User.create({
        name: 'Olivia Stone',
        email: 'olivia@wizzytrack.io',
        password: 'password123',
        role: 'admin'
      });
      console.log('Created default user');
    }

    let project = await Project.findOne();
    if (!project) {
      project = await Project.create({
        name: 'Storefront',
        description: 'Main storefront project',
        members: [user._id]
      });
      console.log('Created default project');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
