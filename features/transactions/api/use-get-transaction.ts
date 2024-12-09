import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";
import { convertAmountFromMiliUnits } from "@/lib/utils";

export const useGetTransaction = (id?: string) => {
  const query = useQuery({
    enabled: !!id,
    queryKey: ["transactions", { id }],
    queryFn: async () => {
      const token = localStorage.getItem("finance-token");
      const response = await client.api.transactions[":id"].$get(
        {
          param: { id },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch transaction.");
      }
      const { data } = await response.json();
      return {
        ...data,
        amount: convertAmountFromMiliUnits(data.amount),
      };
    },
  });
  return query;
};
