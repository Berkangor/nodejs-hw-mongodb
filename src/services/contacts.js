import { isValidObjectId } from 'mongoose';
import ContactCollection from '../db/models/contacts.js'; 


export const getAllContacts = async () => {
  return ContactCollection.find(); 
};


export const getContactById = async (id) => {
  if (!isValidObjectId(id)) return null; 
  return ContactCollection.findById(id); 
};


export const createContact = async (payload) => {
  return ContactCollection.create(payload);
};


export const updateContact = async (id, payload) => {
  if (!isValidObjectId(id)) return null;

  return ContactCollection.findByIdAndUpdate(id, payload, {
    new: true,          
    runValidators: true 
  }); // bulunamazsa null
};

export const deleteContact = async (id) => {
  if (!isValidObjectId(id)) return null;
  return ContactCollection.findByIdAndDelete(id); // bulunamazsa null
};
