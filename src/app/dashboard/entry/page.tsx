import PrayerForm from "@/components/PrayerForm";
import {auth} from "@/auth";


const EntryForm = async () => {
    const session = await auth();
  return (
    <div>
      <PrayerForm session={session} />
    </div>
  )
}
export default EntryForm;