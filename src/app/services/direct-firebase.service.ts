import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, limit } from 'firebase/firestore';
import { firebaseConfig } from '../../environments/firebase.config';
import { Product, Category } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DirectFirebaseService {
  private db: any;

  constructor() {
    // Initialize Firebase directly
    const app = initializeApp(firebaseConfig);
    this.db = getFirestore(app);
  }

  // Add a single product
  async addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const productsCollection = collection(this.db, 'products');
      const productData = {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(productsCollection, productData);
      console.log('Product added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }

  // Add a single category
  async addCategory(category: Omit<Category, 'id'>): Promise<string> {
    try {
      const categoriesCollection = collection(this.db, 'categories');
      const docRef = await addDoc(categoriesCollection, category);
      console.log('Category added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  }

  // Check if data exists
  async checkDataExists(): Promise<boolean> {
    try {
      const productsCollection = collection(this.db, 'products');
      const q = query(productsCollection, limit(1));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking data:', error);
      return false;
    }
  }

  // Test Firebase connection
  async testConnection(): Promise<boolean> {
    try {
      const testCollection = collection(this.db, 'test');
      const testDoc = {
        message: 'Connection test',
        timestamp: new Date()
      };
      await addDoc(testCollection, testDoc);
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}
