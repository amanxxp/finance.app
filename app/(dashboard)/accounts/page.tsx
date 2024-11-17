"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNewAccount } from "@/features/accounts/hooks/use-new-account";
import { Loader2, Plus } from "lucide-react";

import { columns } from "./columns";
import { DataTable } from "@/components/data-table";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { Skeleton } from "@/components/ui/skeleton";
import { useBulkDeleteAccounts } from "@/features/accounts/api/use-bulk-delete-accounts";

const AccountsPage = () => {
  const newAccount = useNewAccount();
  const deleteAccount = useBulkDeleteAccounts();
  const accountQuery = useGetAccounts();
  const accounts = accountQuery.data || [];

  const isDisabled = accountQuery.isLoading || accountQuery.isPending;

  if (accountQuery.isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24 py-12">
        <Card className="border-none drop-shadow-sm">
          <CardHeader>
            <Skeleton className="h-8 w-28" />
            <CardContent>
              <div className="h-[500px] w-full flex items-center justify-center">
                <Loader2 className="size-6 text-slate-400 animate-spin" />
              </div>
            </CardContent>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24 py-12">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">Account Page</CardTitle>
          <Button size={"sm"} onClick={newAccount.onOpen}>
            <Plus className="size-4 mr-2" />
            Add new
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={accounts}
            filterKey={"name"}
            disabled={isDisabled}
            onDelete={(row) => {
              const ids = row.map((r) => r.original.id);
              deleteAccount.mutate({ ids });
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountsPage;
