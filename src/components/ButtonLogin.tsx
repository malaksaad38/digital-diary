"use client"
import { signIn } from "next-auth/react";

const ButtonLogin = () => {
  return (
    <button
      className={"px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"}
      onClick={() => {
        signIn(undefined, { callbackUrl: "/dashboard" });
      }}
    >
      Login
    </button>
  );

};

export default ButtonLogin;
