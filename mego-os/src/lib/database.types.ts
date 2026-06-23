export type CustomerType = "individual" | "student" | "business" | "real_estate";
export type CustomerSource = "walk_in" | "facebook" | "whatsapp" | "referral" | "other";
export type DeviceType =
  | "laptop"
  | "pc"
  | "mobile"
  | "receiver"
  | "printer"
  | "router"
  | "camera"
  | "other";
export type OrderStatus =
  | "new"
  | "checking"
  | "waiting_customer_approval"
  | "waiting_part"
  | "in_progress"
  | "ready"
  | "delivered"
  | "cancelled";
export type OrderPriority = "normal" | "urgent";
export type ServiceCategory =
  | "repair"
  | "printing"
  | "student"
  | "business"
  | "cctv"
  | "network"
  | "receiver"
  | "ads"
  | "signage"
  | "accessory"
  | "other";
export type SaleType = "service" | "product" | "mixed";
export type PaymentMethod = "cash" | "instapay" | "vodafone_cash" | "bank" | "other";
export type ItemType = "service" | "product";
export type ExpenseCategory =
  | "rent"
  | "tools"
  | "paint"
  | "electricity"
  | "internet"
  | "ads"
  | "stock"
  | "transport"
  | "other";
export type SubscriptionPackage = "Start" | "Business" | "Pro" | "Custom";
export type SubscriptionStatus = "active" | "paused" | "cancelled" | "expired";
export type FollowupStatus = "pending" | "done" | "cancelled";
export type PrintJobType =
  | "print"
  | "copy"
  | "scan"
  | "pdf"
  | "cv"
  | "banner"
  | "signage"
  | "led"
  | "sticker"
  | "other";
export type PrintJobStatus = "new" | "in_progress" | "ready" | "delivered" | "cancelled";
export type UserRole = "admin" | "staff";

export interface Profile {
  id: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  phone2: string | null;
  area: string | null;
  address: string | null;
  customer_type: CustomerType;
  source: CustomerSource;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RepairOrder {
  id: string;
  order_no: string;
  customer_id: string;
  device_type: DeviceType;
  device_brand: string | null;
  device_model: string | null;
  problem_description: string;
  received_accessories: string | null;
  device_condition: string | null;
  data_privacy_note: string | null;
  estimated_price: number | null;
  final_price: number | null;
  paid_amount: number;
  status: OrderStatus;
  priority: OrderPriority;
  received_at: string;
  expected_delivery_at: string | null;
  delivered_at: string | null;
  technician_notes: string | null;
  customer_notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  starting_price: number | null;
  cost_estimate: number | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string | null;
  sku: string | null;
  quantity: number;
  purchase_price: number | null;
  selling_price: number | null;
  min_quantity: number;
  supplier_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  sale_no: string;
  customer_id: string | null;
  order_id: string | null;
  sale_type: SaleType;
  total_amount: number;
  paid_amount: number;
  payment_method: PaymentMethod;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  item_type: ItemType;
  item_name: string;
  inventory_item_id: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  payment_method: PaymentMethod;
  expense_date: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface BusinessSubscription {
  id: string;
  customer_id: string;
  business_name: string;
  package_name: SubscriptionPackage;
  monthly_price: number;
  start_date: string;
  renewal_date: string;
  status: SubscriptionStatus;
  included_visits: number;
  used_visits: number;
  included_remote_support: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Followup {
  id: string;
  customer_id: string;
  order_id: string | null;
  title: string;
  followup_date: string;
  status: FollowupStatus;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface PrintJob {
  id: string;
  job_no: string;
  customer_id: string | null;
  job_type: PrintJobType;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  paid_amount: number;
  status: PrintJobStatus;
  due_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  repair_order_id: string | null;
  print_job_id: string | null;
  business_subscription_id: string | null;
  amount: number;
  payment_method: PaymentMethod;
  paid_at: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface ShopSettings {
  id: string;
  shop_name: string;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  slogan: string | null;
  receipt_footer: string | null;
  created_at: string;
  updated_at: string;
}
