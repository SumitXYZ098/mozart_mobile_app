/* eslint-disable @typescript-eslint/no-explicit-any */
import { addLabels, getLabelsList, ILabel } from "@/api/labelApi";
import { useLabelsStore } from "@/stores/labelListStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";

// Fetch labels list
export const useLabelsList = () => {
  const { setLabels, setError, setLoading } = useLabelsStore();

  const query = useQuery<{ data: ILabel[] }, Error>({
    queryKey: ["labelsList"],
    queryFn: getLabelsList,
  });

  React.useEffect(() => {
    setLoading(query.isFetching);

    if (query.isSuccess && query.data) {
      setLabels(query.data.data);
    }

    if (query.isError && query.error) {
      setError(query.error.message || "Failed to fetch labels");
    }
  }, [query.isFetching, query.isSuccess, query.isError, query.data, query.error, setLabels, setError, setLoading]);

  return query;
};

// Add label
export const useAddLabel = () => {
  const queryClient = useQueryClient();
  const { setError } = useLabelsStore();

  return useMutation({
    mutationFn: addLabels,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labelsList"] });
    },
    onError: (error: any) => {
      setError(error.message || "Failed to add label");
    },
  });
};
