"use client";

import React, { useState } from "react";
import { PlusCircleIcon } from "lucide-react";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "../ui/menubar";
import { useRouter } from "next/navigation";

const ActionBar = () => {
  const router = useRouter();

  const redirectToAddProject = () => {
    router.push("/project/new");
  };

  return (
    <div className="border-b border-dotted flex justify-between items-center pb-1.5 flex-wrap gap-1">
      <h1 className="text-xl font-bold text-foreground">Projects</h1>
      <div className="flex gap-2 justify-end items-center">
        <Menubar className="w-full">
          <MenubarMenu>
            <MenubarTrigger onClick={redirectToAddProject}>
              <PlusCircleIcon size={"16px"} /> &nbsp; New
            </MenubarTrigger>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Filter By</MenubarTrigger>
            <MenubarContent>
              <MenubarSub>
                <MenubarSubTrigger>Categories</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem>Search the web</MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>Find...</MenubarItem>
                  <MenubarItem>Find Next</MenubarItem>
                  <MenubarItem>Find Previous</MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger>Popular By</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem>Search the web</MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>Find...</MenubarItem>
                  <MenubarItem>Find Next</MenubarItem>
                  <MenubarItem>Find Previous</MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Sort By</MenubarTrigger>
            <MenubarContent>
              <MenubarCheckboxItem>Asc</MenubarCheckboxItem>
              <MenubarCheckboxItem checked>Desc</MenubarCheckboxItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>
    </div>
  );
};

export default ActionBar;
