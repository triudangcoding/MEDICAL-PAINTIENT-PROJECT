"use client";

import type { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/data-table/data-table-CSR/data-table-view-options";
import { X } from "lucide-react";
import { useCallback, useState } from "react";
import _ from "lodash";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const [valueSearchInput, setValueSearchInput] = useState<string>("");
  const isFiltered =
    table.getState().columnFilters.length > 0 ||
    !!table.getState().globalFilter;

  const debouncedSearch = useCallback(
    _.debounce((value) => {
      table.setGlobalFilter(value);
    }, 500),
    []
  );

  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValueSearchInput(event.target.value);
    debouncedSearch(event.target.value);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          type="search"
          placeholder="Tìm kiếm..."
          className="m-1 pl-4 md:w-[300px] lg:w-[400px]"
          value={valueSearchInput}
          onChange={handleSearchInput}
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters();
              table.setGlobalFilter("");
              setValueSearchInput("");
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
