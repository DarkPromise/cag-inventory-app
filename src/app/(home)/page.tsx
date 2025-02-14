"use server";

import "server-only";
import Inventory from "../../components/inventory/Inventory.tsx";

export interface HomePageProps {}

export const HomePage = async (props: HomePageProps) => {
  return (
    <main className="flex grow flex-col px-8 py-4">
      <Inventory />
    </main>
  );
};

export default HomePage;
