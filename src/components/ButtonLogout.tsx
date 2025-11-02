"use client";

import { signOut } from "next-auth/react";

const ButtonLogout = () => {
  return (
    <button
      className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl"
      onClick={() => {
        signOut();
      }}
    >
      Logout
    </button>
  );
};

export default ButtonLogout;

