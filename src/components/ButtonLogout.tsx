"use client";

import { signOut } from "next-auth/react";
import {Button} from "@/components/ui/button";
import {LogOutIcon} from "lucide-react";
import {redirect} from "next/navigation";


const ButtonLogout = () => {
  return (
      <Button
        size="sm"
        onClick={() => {
            signOut()
        }}
        className={"w-full"}
      >
        <LogOutIcon/>
        Logout
      </Button>

  );
};

export default ButtonLogout;

