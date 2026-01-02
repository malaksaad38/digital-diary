import PrayerForm from "@/components/PrayerForm";
import {auth} from "@/auth";
import DiaryForm from "@/components/DiaryForm";
import {Button} from "@/components/ui/button";
import {NotebookPen, NotebookTabs, StarIcon, StarsIcon} from "lucide-react";
import Link from "next/link";


const EntryForm = async () => {
    const session = await auth();
    return (
        <div className={"w-full"}>
            <div className={"fixed md:hidden bottom-20 left-4 right-4 z-20 grid grid-cols-2 gap-2"}>
               <Link href={"#PrayerForm"} >
                   <Button className={"w-full"} >
                       <StarsIcon/> Create Prayer
                   </Button>
               </Link>
                <Link href={"#DiaryForm"} >
                <Button className={"w-full"}>
                    <NotebookPen/> Create Prayer
                </Button>
                </Link>

            </div>

            <div className="grid md:grid-cols-2 gap-6 px-4 mb-3 pb-8 pt-4 md:pt-8">
                <div id={"PrayerForm"} className={"w-full"}>
                    <PrayerForm session={session}/>
                </div>
                <div id={"DiaryForm"} className={"w-full"}>
                    <DiaryForm session={session}/>

                </div>
            </div>

        </div>
    )
}
export default EntryForm;