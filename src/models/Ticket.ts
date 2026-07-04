import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  project: mongoose.Types.ObjectId;
  creator: mongoose.Types.ObjectId;
  assignee?: mongoose.Types.ObjectId;
}

const TicketSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  assignee: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model<ITicket>('Ticket', TicketSchema);
