"use server";

import "server-only";
import Inventory from "../../components/inventory/Inventory.tsx";

export default async function HomePage() {
  return (
    <main className="flex grow flex-col px-8 py-4">
      <Inventory />
    </main>
  );
}
