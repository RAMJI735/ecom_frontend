import OrdersView from "@views/orders";

export const metadata = {
  title: "All Orders | ElectroCare Admin",
  description: "Manage orders, monitor status, and fulfill customer requests.",
};

export default function OrdersPage() {
  return <OrdersView initialStatus="all" title="All Orders" />;
}
