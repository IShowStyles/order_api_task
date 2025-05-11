import { Orders } from "@/components";
import { fetchUsers } from "@/service/get-users";
import React from "react";

function OrdersPage() {
  const [users, setUsers] = React.useState([]);

  React.useEffect(() => {
    async function loadUsers() {
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
    }
    loadUsers().then(() => {});
  }, []);

  return (
    <main className="container mx-auto py-10 px-4 space-y-10">
      <h1 className="text-3xl font-bold tracking-tight text-left">
        Order Management System
      </h1>
      <div className="max-w-3xl w-full">
        <Orders users={users} />
      </div>
    </main>
  );
}

export default OrdersPage;
