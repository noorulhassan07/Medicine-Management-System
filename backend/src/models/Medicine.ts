import { Schema, model, Document } from 'mongoose';


export interface IMedicine extends Document {
name: string;
quantity: number;
manufacturingDate: Date;
expiryDate: Date;
dateOfEntry: Date;
price: number;
}


const MedicineSchema = new Schema<IMedicine>({
name: { type: String, required: true },
quantity: { type: Number, required: true, default: 0 },
manufacturingDate: { type: Date, required: true },
expiryDate: { type: Date, required: true },
dateOfEntry: { type: Date, required: true, default: () => new Date() },
price: { type: Number, required: true, default: 0 }
});


export default model<IMedicine>('Medicine', MedicineSchema);