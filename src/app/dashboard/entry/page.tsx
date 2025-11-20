import PrayerForm from "@/components/PrayerForm";
import {auth} from "@/auth";
import DiaryForm from "@/components/DiaryForm";
import {Separator} from "@/components/ui/separator";


const EntryForm = async () => {
    const session = await auth();
  return (
    <div className={"p-4 space-y-4"}>
      <PrayerForm session={session} />
        <Separator/>
      <DiaryForm session={session} />
    </div>
  )
}
export default EntryForm;