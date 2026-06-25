export type RequestStatus = "new" | "contacted" | "booked" | "done" | "cancelled";

export type ServiceRequestRow = {
  id: string;
  customer_name: string;
  phone: string;
  customer_type: string;
  service_type: string;
  service_place: string;
  area: string;
  description: string;
  preferred_time: string | null;
  status: RequestStatus;
  source: string;
  created_at: string;
  updated_at: string;
};
