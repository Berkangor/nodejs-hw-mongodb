import { Schema, model } from 'mongoose';

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true, // boşlukları temizlemek için
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    isFavourite: {
      type: Boolean,
      default: false,
    },
    contactType: {
      type: String,
      enum: ['work', 'home', 'personal'],
      required: true,
      default: 'personal', 
    },
  },
  {
    timestamps: true, // createdAt, updatedAt otomatik eklenecek
    versionKey: false, // __v kaldırıldı
  }
);

const ContactCollection = model('Contact', contactSchema); 
export default ContactCollection;
