export interface GetTransactionInResponse {
  id: number;
  product: {
    id: number;
    name: string;
  };
  customer: {
    id: number;
    name: string;
  };
  qty: number;
  converted_qty: number;
  unit: string;
}
