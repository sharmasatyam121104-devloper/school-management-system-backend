import { Schema, model, Document } from "mongoose";

export interface ICounter extends Document {
  key: string;   // "teacher" | "student" | "parent"
  seq: number;
}

const counterSchema = new Schema<ICounter>({
  key: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

export const CounterModel = model<ICounter>("Counter", counterSchema);
