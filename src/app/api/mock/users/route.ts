import { NextResponse } from "next/server";

const mockUsers = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "admin" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "user" },
  { id: 3, name: "Bob Wilson", email: "bob@example.com", role: "user" },
];

export async function GET() {
  return NextResponse.json(mockUsers);
}


