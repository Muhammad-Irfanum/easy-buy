import { NavBar } from "@/components/layout/NavBar";
import { Button } from "@headlessui/react";



export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 ">
      <NavBar />
      <h1 className="text-4xl font-bold">Hello, Next.js!</h1>
      <Button>
        <a href="/admin" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
          <span className="font-semibold">Dashboard</span>
        </a>
      </Button>
       
      
      
    </main>
  )
}
