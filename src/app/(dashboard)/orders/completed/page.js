import OrdersView from "@views/orders";

export const metadata = {
  title: "Completed Orders | ElectroCare Admin",
  description: "Delivered customer shipments and fulfilled transactions.",
};

export default function CompletedOrdersPage() {
  return (
    <OrdersView
      initialStatus="Delivered"
      title="Completed Orders"
      subtitle="Delivered customer shipments, fulfilled services, and archive records."
    />
  );
}
