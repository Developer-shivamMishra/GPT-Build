import { ModeToggle } from "@/components/ui/more-toggle";
import { startnewChat } from "@/feature/home/action/start-new-chat";
import { UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Image from "next/image";

const Home = async () => {
  const conversationId = await startnewChat()
  redirect(`/c/${conversationId}`)
 
}
export default Home