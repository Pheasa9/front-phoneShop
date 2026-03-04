import { Injectable } from '@angular/core';

export interface PurchaseRecord {
  saleId: number;
  soldDate: string;
  items: { productName: string; unit: number; unitPrice: number; amount: number }[];
  total: number;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class PurchaseHistoryService {
  private readonly KEY = 'purchase_history';

  /** Get all purchase records, newest first */
  getAll(): PurchaseRecord[] {
    try {
      const raw = localStorage.getItem(this.KEY);
      const arr: PurchaseRecord[] = raw ? JSON.parse(raw) : [];
      return arr.sort((a, b) =>
        new Date(b.soldDate).getTime() - new Date(a.soldDate).getTime()
      );
    } catch {
      return [];
    }
  }

  /** Get the most recent N records */
  getRecent(n: number): PurchaseRecord[] {
    return this.getAll().slice(0, n);
  }

  /** Save a new purchase from checkout receipt */
  addFromReceipt(receipt: any): void {
    const record: PurchaseRecord = {
      saleId: receipt.saleId ?? receipt.id ?? Date.now(),
      soldDate: receipt.soldDate ?? receipt.createdAt ?? new Date().toISOString(),
      items: (receipt.items ?? receipt.products ?? []).map((it: any) => ({
        productName: it.productName ?? it.name ?? 'Product',
        unit: it.unit ?? it.qty ?? 1,
        unitPrice: it.unitPrice ?? it.price ?? 0,
        amount: it.amount ?? (it.unit ?? 1) * (it.unitPrice ?? it.price ?? 0)
      })),
      total: receipt.total ?? receipt.amount ?? 0,
      status: 'pending'
    };

    const all = this.getAll();
    // Avoid duplicates by saleId
    if (!all.find(r => r.saleId === record.saleId)) {
      all.unshift(record);
      localStorage.setItem(this.KEY, JSON.stringify(all));
    }
  }

  /** Clear all history */
  clear(): void {
    localStorage.removeItem(this.KEY);
  }
}
