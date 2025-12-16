import PrayerForm from "@/components/PrayerForm";
import {auth} from "@/auth";
import DiaryForm from "@/components/DiaryForm";
import {Separator} from "@/components/ui/separator";


const EntryForm = async () => {
    const session = await auth();
  return (
    <div className={"flex flex-col md:flex-row px-4 gap-6 mb-3"}>
      <PrayerForm session={session} />
      <DiaryForm session={session} />
    </div>
  )
}
export default EntryForm;