"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { ApiClient } from "@/lib/api-client";

interface User {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  google_id: string | null;
  created_at: string;
  is_active: boolean;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await ApiClient.get<User[]>("/api/admin/users");
        if (response.error) {
          throw new Error(response.error.message);
        }
        setUsers(response.data || []);
      } catch (err) {
        setError("Failed to fetch users");
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>
        <div className="p-6 flex-1 flex items-center justify-center">
          Loading users...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>
        <div className="p-6 flex-1">
          <Card className="p-6 w-full bg-red-50 border-red-200">
            <div className="text-red-600 font-semibold">{error}</div>
            <p className="mt-2 text-sm text-red-500">
              This page is restricted to administrators only. If you believe you should have access, please contact your system administrator.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-screen">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold">User Management</h1>
      </div>
      <div className="p-6 flex-1">
        <Card className="h-full">
          <Table className="">
            <TableCaption>A list of all registered users</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                 
                 
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
