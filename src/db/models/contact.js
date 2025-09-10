import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const contactSchema = new Schema(
  {
    // Şemanıza göre 'userId' ya da 'owner' kullanın.
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },

    name:  { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },

    photo: { type: String }, // Cloudinary URL

    // İsterseniz:
    contactType: { type: String, enum: ['personal', 'work'], default: 'personal' },
    isFavourite: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

// 🔴 DİKKAT: default değil, **named export**!
export const Contact = model('contacts', contactSchema);
