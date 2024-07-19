import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useOpenAccount } from "../hooks/use-open-account";
import { useGetAccount } from "../api/use-get-account";
import { AccountForm } from "./account-form";
import { insertAccountSchema } from "@/db/schema";
import { useConfirm } from "@/hooks/use-confirm";
import { z } from "zod";
import { useEditAccount } from "../api/use-edit-account";
import { useDeleteAccount } from "../api/use-delete-account";
import { Loader2 } from "lucide-react";

const formSchema = insertAccountSchema.pick({
  name: true,
});

type FormValue = z.input<typeof formSchema>;

export const EditAccountSheet = () => {
  const { isOpen, onClose, id } = useOpenAccount(); //used this because every time we refresh the sheet element comes, but we want it to come only when we click the button
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "You are about to delete this transaction"
  )
  const accountQuery = useGetAccount(id);
  const editMutation = useEditAccount(id);
  const deleteMutation = useDeleteAccount(id);
  const isLoading = accountQuery.isLoading;
  
  const isPending = editMutation.isPending  || deleteMutation.isPending;

  const onSubmit = (values: FormValue) => {
    editMutation.mutate(values, {
      onSuccess: () => {
        onClose(); // this will close the add account sheet automatically after the onsuccess methord
      },
    });
  };
  const onDelete = async () =>{
    const ok = await confirm();
    if(ok){
        deleteMutation.mutate(
            undefined,
            {
                onSuccess : () =>{
                    onClose();
                }
            }
        )
    }
  }
  const defaultValues = accountQuery.data
    ? {
        name: accountQuery.data.name,
      }
    : {
        name: "",
      };
  return (
    <>
    <ConfirmDialog/>
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>Edit Account</SheetTitle>
          <SheetDescription>
            Edit an existing Account
          </SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <AccountForm
          id ={id}
            onSubmit={onSubmit}
            disabled={isPending}
            defaultValues={defaultValues}
            onDelete={onDelete}
          />
        )}
      </SheetContent>
    </Sheet>
    </>
  );
};
