import PrayerForm from "@/components/PrayerForm";
import {auth} from "@/auth";
import DiaryForm from "@/components/DiaryForm";


const EntryForm = async () => {
    const session = await auth();
  return (
    <div className={"px-4"}>
      <PrayerForm session={session} />
      <DiaryForm session={session} />
    </div>
  )
}
export default EntryForm;