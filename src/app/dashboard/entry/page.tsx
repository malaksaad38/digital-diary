import PrayerForm from "@/components/PrayerForm";
import {auth} from "@/auth";
import DiaryForm from "@/components/DiaryForm";


const EntryForm = async () => {
    const session = await auth();
    return (
        <div className="flex flex-col min-[975px]:flex-row gap-6 px-4 mb-3"
        >
            <PrayerForm session={session}/>
            <DiaryForm session={session}/>
        </div>
    )
}
export default EntryForm;