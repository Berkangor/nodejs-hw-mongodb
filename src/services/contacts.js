import { isValidObjectId } from 'mongoose';
import ContactCollection from '../db/models/contacts.js';

// Tüm contact’ları getir
export const getAllContacts = async () => {
  try {
    const contacts = await ContactCollection.find();
    return contacts; // Boş array olabilir ama hiçbir zaman null olmaz
  } catch (error) {
    console.error('Error in getAllContacts:', error);
    throw error; // Hatanın controller’a gitmesi daha iyi olur
  }
};

// ID'ye göre contact getir
export const getContactById = async (id) => {
  if (!isValidObjectId(id)) {
    return null; // Geçersiz ObjectId ise direkt null döner
  }

  try {
    const contact = await ContactCollection.findById(id);
    return contact; // Bulunmazsa mongoose zaten null döner
  } catch (error) {
    console.error('Error in getContactById:', error);
    throw error; // Hata fırlatılır, controller yakalar
  }
};
