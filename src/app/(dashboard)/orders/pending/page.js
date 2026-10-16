import OrdersView from "@views/orders";

export const metadata = {
  title: "Pending Orders | ElectroCare Admin",
  description: "Orders awaiting payment confirmation, preparation, or fulfillment dispatch.",
};

export default function PendingOrdersPage() {
  return (
    <OrdersView
      initialStatus="Pending"
      title="Pending Orders"
      subtitle="Orders awaiting payment confirmation, preparation, or fulfillment dispatch."
    />
  );
}
