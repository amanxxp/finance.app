import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export const useGetCategories = () => {
  const query = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const token = localStorage.getItem("finance-token");
      const response = await client.api.categories.$get(
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      // const response = await fetch("/api/categories", {
      //   method: "GET",
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //     "Content-Type": "application/json",
      //   },
      // });
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const { data } = await response.json();
      return data;
    },
  });
  return query;
};
