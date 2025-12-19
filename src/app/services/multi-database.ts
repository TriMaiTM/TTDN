import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore'; // Main DB (Modular)
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore as FirebaseFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'; // Branch DB (Modular)

@Injectable({
  providedIn: 'root'
})
export class MultiDbService {
  // Biến giữ kết nối tới Database Con (Hà Nội hoặc HCM)
  private currentBranchDb: FirebaseFirestore | null = null;
  private currentBranchApp: FirebaseApp | null = null;
  public currentBranchName: string = '';

  // Inject Main DB (đã được config trong app.config.ts)
  private mainDb = inject(Firestore);

  constructor() { }

  /**
   * Hàm này chạy sau khi Login thành công
   * Nhiệm vụ: Lấy config từ Main -> Kết nối sang Chi nhánh
   */
  async connectToBranch(userUid: string): Promise<boolean> {
    try {
      console.log('--- BẮT ĐẦU ĐỊNH TUYẾN DATABASE ---');

      // 1. Tìm user trong bảng 'users' của Main DB
      const userDocRef = doc(this.mainDb, 'users', userUid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        console.error('Lỗi: User này không tồn tại trong Main DB (chưa được phân quyền)');
        return false;
      }

      const userData = userDocSnap.data() as any;
      const branchConfig = userData.branchConfig; // Đây là cục JSON config mình đã nhập
      this.currentBranchName = userData.branchName || 'Unknown Branch';

      if (!branchConfig) {
        console.error('Lỗi: User này chưa được gán vào chi nhánh nào!');
        return false;
      }

      console.log(`>>> User thuộc chi nhánh: ${this.currentBranchName}`);
      console.log(`>>> Đang kết nối tới Project ID: ${branchConfig.projectId}`);

      // 2. Khởi tạo app con (Dynamic App Initialization)
      const appName = `Branch_${branchConfig.projectId}`; // Đặt tên app để không trùng

      // Kiểm tra xem đã kết nối chưa
      if (getApps().length > 0 && getApps().some(app => app.name === appName)) {
        this.currentBranchApp = getApp(appName);
      } else {
        this.currentBranchApp = initializeApp(branchConfig, appName);
      }

      // 3. Lấy instance Firestore của chi nhánh đó
      this.currentBranchDb = getFirestore(this.currentBranchApp);

      console.log('>>> [SUCCESS] KẾT NỐI THÀNH CÔNG TỚI DATABASE CHI NHÁNH!');
      console.log('>>> Branch App Name:', this.currentBranchApp.name);
      console.log('>>> Branch Config:', branchConfig);
      return true;

    } catch (error) {
      console.error('>>> [FAILED] Lỗi nghiêm trọng khi kết nối DB chi nhánh:', error);
      console.error('>>> Stack:', error);
      return false;
    }
  }

  // --- HÀM HELPER ĐỂ LẤY DB CON ---
  getDB() {
    if (!this.currentBranchDb) {
      throw new Error("Chưa kết nối tới Database chi nhánh nào! Hãy Login trước.");
    }
    return this.currentBranchDb;
  }
}