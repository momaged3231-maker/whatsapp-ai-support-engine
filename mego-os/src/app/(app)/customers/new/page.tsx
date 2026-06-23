import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerForm } from "@/components/customer-form";
import { createCustomer } from "../actions";

export default function NewCustomerPage() {
  return (
    <div>
      <PageHeader title="عميل جديد" />
      <Card className="max-w-2xl">
        <CardContent>
          <CustomerForm action={createCustomer} />
        </CardContent>
      </Card>
    </div>
  );
}
