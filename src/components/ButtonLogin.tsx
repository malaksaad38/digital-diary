"use client"
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {LogInIcon} from "lucide-react";

const ButtonLogin = () => {
  return (

    <Link href={"/login"}>
      <Button
      size="lg"
      >
        <LogInIcon/>
        LogIn
      </Button>
    </Link>

  );

};

export default ButtonLogin;
