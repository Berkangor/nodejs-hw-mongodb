import { isValidObjectId } from 'mongoose';
import ContactCollection from '../db/models/contacts.js';

export const getAllContacts = async () => {
  try {
    const contacts = await ContactCollection.find();
    return contacts; 
  } catch (error) {
    console.error('Error in getAllContacts:', error);
    throw error; 
  }
};

// ID'ye göre contact getir
export const getContactById = async (id) => {
  if (!isValidObjectId(id)) {
    return null; 
  }

  try {
    const contact = await ContactCollection.findById(id);
    return contact; 
  } catch (error) {
    console.error('Error in getContactById:', error);
    throw error; 
  }
};
