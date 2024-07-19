"use client"

import { useEffect, useState } from "react";
import { NewAccountSheet } from "../features/accounts/components/new-account-sheet"
import {EditAccountSheet} from "../features/accounts/components/edit-account-sheet"

export const SheetProvider =()=>{
    const [isMounted , setIsMounted] = useState(false);
    useEffect(()=>{
        setIsMounted(true);
    },[]);  //for fixing hydration error 
    if(!isMounted) return true;
    return (
        <>
        <NewAccountSheet/>
        <EditAccountSheet/>
        </>
    )
}