import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { code } = await req.json()
  
  const text = code.toLowerCase()
  
  let algorithm = "unknown"
  
  if (
    text.includes("binary") ||
    (text.includes("left") && text.includes("right") && text.includes("mid"))
  ) {
    algorithm = "binary-search"
  }
  
  else if (
    text.includes("queue") && text.includes("graph")
  ) {
    algorithm = "bfs"
  }
  
  else if (
    text.includes("stack") || text.includes("dfs")
  ) {
    algorithm = "dfs"
  }
  
  else if (
    text.includes("pivot") || text.includes("quicksort")
  ) {
    algorithm = "quicksort"
  }
  
  return NextResponse.json({
    algorithm
  })
}
