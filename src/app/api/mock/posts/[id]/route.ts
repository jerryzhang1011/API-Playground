import { NextRequest, NextResponse } from "next/server";

const mockPosts = [
  { id: 1, title: "Hello World", body: "This is my first post", userId: 1 },
  { id: 2, title: "Learning API Design", body: "APIs are the backbone of modern web development", userId: 1 },
  { id: 3, title: "Mock Data is Useful", body: "Testing with mock data helps catch bugs early", userId: 2 },
  { id: 4, title: "REST vs GraphQL", body: "Both have their pros and cons", userId: 2 },
  { id: 5, title: "TypeScript Tips", body: "Strong typing prevents many runtime errors", userId: 3 },
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const post = mockPosts.find((p) => p.id === id);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const post = mockPosts.find((p) => p.id === id);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const updatedPost = { ...post, ...body };
    return NextResponse.json(updatedPost);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const post = mockPosts.find((p) => p.id === id);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Post deleted", id });
}


