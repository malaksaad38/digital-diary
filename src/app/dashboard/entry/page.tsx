import PrayerForm from "@/components/PrayerForm";
import {auth} from "@/auth";
import DiaryForm from "@/components/DiaryForm";


const EntryForm = async () => {
    const session = await auth();
    return (
        <div className="flex flex-col min-[975px]:flex-row gap-6 px-4 mb-3 pt-4 md:pt-8"
        >
            <PrayerForm session={session}/>
            <DiaryForm session={session}/>
        </div>
    )
}
export default EntryForm;