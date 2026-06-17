import { CustomerTable } from "@/components/customers/customer-table";

export default function CustomersPage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">
        Customers
      </h1>

      <p className="mt-2 text-muted-foreground">
        Monitor and manage customer accounts
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-6">
          <p>Total Customers</p>
          <h2 className="text-3xl font-bold">
            2847
          </h2>
        </div>

        <div className="rounded-lg border p-6">
          <p>Healthy</p>
          <h2 className="text-3xl font-bold">
            1243
          </h2>
        </div>

        <div className="rounded-lg border p-6">
          <p>At Risk</p>
          <h2 className="text-3xl font-bold">
            612
          </h2>
        </div>

        <div className="rounded-lg border p-6">
          <p>Critical</p>
          <h2 className="text-3xl font-bold">
            187
          </h2>
        </div>
      </div>

      <div className="mt-8">
        <CustomerTable />
      </div>
    </div>
  );
}