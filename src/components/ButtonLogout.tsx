"use client";

import { signOut } from "next-auth/react";
import {Button} from "@/components/ui/button";
import {LogOutIcon} from "lucide-react";

const ButtonLogout = () => {
  return (
      <Button
        size="sm"
        onClick={() => {
          signOut();
        }}
      >
        <LogOutIcon/>
        Logout
      </Button>

  );
};

export default ButtonLogout;

