"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";
import { Loader2, Plus } from "lucide-react";
import { transactions as transactionSchema } from "@/db/schema";
import { columns } from "./columns";
import { DataTable } from "@/components/data-table";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { Skeleton } from "@/components/ui/skeleton";
import { useBulkDeleteTransactions } from "@/features/transactions/api/use-bulk-delete-transactions";
import { useState } from "react";
import { UploadButton } from "./upload-button";
import { ImportCard } from "./import-card";
import { useSelectAccount } from "@/features/accounts/hooks/use-select-account";
import { toast } from "sonner";
import { useBulkCreateTransaction } from "@/features/transactions/api/use-bulk-create-transactions";

enum VARIANT {
  LIST = "LIST",
  IMPORT = "IMPORT",
}

const INITIAL_IMPORT_RESULTS = {
  data: [],
  errors: [],
  meta: {},
};

const TransactionPage = () => {
  const [AccountDialog, confirm] = useSelectAccount();
  const [variant, setVariant] = useState<VARIANT>(VARIANT.LIST);
  const [importResult, setImportResult] = useState(INITIAL_IMPORT_RESULTS);

  const onUpload = (results: typeof INITIAL_IMPORT_RESULTS) => {
    setImportResult(results);
    setVariant(VARIANT.IMPORT);
  };

  const onCancelImport = () => {
    setImportResult(INITIAL_IMPORT_RESULTS);
    setVariant(VARIANT.LIST);
  };

  const newTransaction = useNewTransaction();
  const createTransaction = useBulkCreateTransaction();
  const deleteTransactions = useBulkDeleteTransactions();
  const transactionsQuery = useGetTransactions();
  const transactions = transactionsQuery.data || [];

  const isDisabled = transactionsQuery.isLoading || transactionsQuery.isPending;

  const onSubmitImport = async (
    values: (typeof transactionSchema.$inferInsert)[]
  ) => {
    const accountId = await confirm();
    if (!accountId) {
      return toast.error("Please select an account to continue.");
    }
    const data = values.map((value) => ({
      ...value,
      accountId: accountId as string,
    }));
    createTransaction.mutate(data, {
      onSuccess: () => {
        onCancelImport();
      },
    });
  };

  if (transactionsQuery.isLoading) {
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

  if (variant === VARIANT.IMPORT) {
    return (
      <>
        <AccountDialog />
        <ImportCard
          data={importResult.data}
          onCancel={onCancelImport}
          onSubmit={onSubmitImport}
        />
      </>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24 py-12">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">
            Transactions History
          </CardTitle>
          <div className="flex items-center gap-3">
            <Button size={"sm"} onClick={newTransaction.onOpen}>
              <Plus className="size-4 mr-2" />
              Add new
            </Button>
            <UploadButton onUpload={onUpload} />
          </div>
        </CardHeader> ̰
        <CardContent>
          <DataTable
            columns={columns}
            data={transactions}
            filterKey={"payee"}
            disabled={isDisabled}
            onDelete={(row) => {
              const ids = row.map((r) => r.original.id);
              deleteTransactions.mutate({ ids });
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionPage;
