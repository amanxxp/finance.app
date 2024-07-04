import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useNewAccount } from "../hooks/use-new-account";
import { AccountForm } from "./account-form";
import { insertAccountSchema } from "@/db/schema";
import { z } from "zod";
import { useCreateAccount } from "../api/use-create-account";

const formSchema = insertAccountSchema.pick({
  name:true,
});

type FormValue = z.input<typeof formSchema>;

export const NewAccountSheet = () => {

 const {isOpen, onClose} = useNewAccount();//used this because every time we refresh the sheet element comes, but we want it to come only when we click the button 
 const mutation = useCreateAccount();

 const onSubmit = (values: FormValue) => {
     mutation.mutate(values,{
      onSuccess:()=>{
        onClose(); // this will close the add account sheet automatically after the onsuccess methord
      }
     })
 };
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>New Account</SheetTitle>
          <SheetDescription>
            Create a new account to track your transactions.
          </SheetDescription>
        </SheetHeader>
        <AccountForm
          onSubmit={onSubmit}
          disabled={mutation.isPending}
          defaultValues={{
            name:"",
          }}
        />
      </SheetContent>
    </Sheet>
  );
};
