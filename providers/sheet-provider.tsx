"use client"

import { useEffect, useState } from "react";
import { NewAccountSheet } from "../features/accounts/components/new-account-sheet"

export const SheetProvider =()=>{
    const [isMounted , setIsMounted] = useState(false);
    useEffect(()=>{
        setIsMounted(true);
    },[]);
    if(!isMounted) return true;
    return (
        <>
        <NewAccountSheet/>
        </>
    )
}