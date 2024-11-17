import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, parse } from "date-fns";
import { useState } from "react";
import { ImportTable } from "./import-table";
import { convertAmountFromMiliUnits } from "@/lib/utils";

const dateFormat = "yyyy-MM-dd";
const outputFormat = "yyyy-MM-dd";

const requiredOptions = ["amount", "date", "payee"];

interface SelectedColumnState {
  [key: string]: string | null;
}

type Props = {
  data: string[][];
  onCancel: () => void;
  onSubmit: (data: any) => void;
};

export const ImportCard = ({ data, onSubmit, onCancel }: Props) => {
  const [selectedColumns, setSelectedColumn] = useState<SelectedColumnState>(
    {}
  );
  const headers = data[0];
  const body = data.slice(1);

  const onTableHeadSelectChange = (
    columnIndex: number,
    value: string | null
  ) => {
    setSelectedColumn((prev) => {
      const newSelectedColumns = { ...prev };
      for (const key in newSelectedColumns) {
        if (newSelectedColumns[key] === value) {
          newSelectedColumns[key] = null;
        }
      }
      if (value === "skip") {
        value = null;
      }
      newSelectedColumns[`column_${columnIndex}`] = value;
      return newSelectedColumns;
    });
  };

  const progress = Object.values(selectedColumns).filter(Boolean).length;

  const handleContinue = () => {
    const getColumnIndex = (column: string) => column.split("_")[1];

    const mappedData = {
      headers: headers.map((_header, index) => {
        const columnIndex = getColumnIndex(`column_${index}`);
        return selectedColumns[`column_${columnIndex}`] || null;
      }),
      body: body
        .map((row) => {
          const transformedRow = row.map((cell, index) => {
            const columnIndex = getColumnIndex(`column_${index}`);
            return selectedColumns[`column_${columnIndex}`] ? cell : null;
          });
          return transformedRow.every((item) => item === null)
            ? []
            : transformedRow;
        })
        .filter((row) => row.length > 0),
    };

    const arrayData = mappedData.body.map((row) => {
      return row.reduce((acc: any, cell, index) => {
        const header = mappedData.headers[index];
        if (header != null) {
          acc[header] = cell;
        }
        return acc;
      }, {});
    });

    const formattedData = arrayData.map((item) => {
      try {
        return {
          ...item,
          amount: convertAmountFromMiliUnits(parseFloat(item.amount)),
          date: format(parse(item.date, dateFormat, new Date()), outputFormat),
        };
      } catch (error) {
        console.error("Error formatting date:", item.date, error);
        return {
          ...item,
          amount: convertAmountFromMiliUnits(parseFloat(item.amount)),
          date: item.date,
        };
      }
    });

    onSubmit(formattedData);
  };

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24 py-12">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">
            Import Transaction
          </CardTitle>
          <div className="flex flex-col lg:flex-row gap-y-2 items-center gap-3">
            <Button size={"sm"} onClick={onCancel} className="w-full lg:w-auto">
              Cancel
            </Button>
            <Button
              className="w-full lg:w-auto"
              size={"sm"}
              disabled={progress < requiredOptions.length}
              onClick={handleContinue}
            >
              Continue ({progress} / {requiredOptions.length})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ImportTable
            headers={headers}
            body={body}
            selectedColumns={selectedColumns}
            onTableHeadSelectChange={onTableHeadSelectChange}
          />
        </CardContent>
      </Card>
    </div>
  );
};
