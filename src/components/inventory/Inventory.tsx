"use client";

import { useEffect, useState } from "react";
import { getInventory } from "./actions/getInventory.ts";
import InventoryTable from "./InventoryTable.tsx";
import { InventoryData, InventoryFilters, InventoryItem } from "../../types/Common.ts";
import { useQuery } from "@tanstack/react-query";
import AddItemDialog from "./dialogs/AddItemDialog.tsx";
import { Box, Button, Checkbox, Chip, MenuItem, Select, SelectChangeEvent, TextField, Typography } from "@mui/material";
import { DesktopDateTimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import clearInventory from "./actions/clearInventory.ts";
import { addItem } from "./actions/addItem.ts";
import { createFakeItem } from "./utils/createFakeItem.ts";
import AdditionalFiltersDialog from "./dialogs/AdditionalFiltersDialog.tsx";
import { cleanObject } from "./utils/cleanObject.ts";
import populateInventory from "./actions/populateInventory.ts";

/** Based on the requirements, the inventory system needs to have the following features:
 *  1. CRU Operations (Add, Read, Update)
 *  2. Filtering Operations (By date range on last_updated_dt, by category)
 *  3. Form to add new items (Name, Price, Category) with validation
 *  4. Table to display all items (Fetching data from the API)
 */

export interface InventoryProps {
  initialData?: InventoryItem[]; // Unused, but normally used for SSR
}

export const Inventory = (props: InventoryProps) => {
  /** Available Categories */
  const [categories, setCategories] = useState<string[]>([]);

  /** Default Filters */
  const [filters, setFilters] = useState<InventoryFilters>({
    dt_from: "",
    dt_to: "",
    category: "",
  });

  /** Inventory Data (using react-query) */
  const {
    isLoading,
    isError,
    data = { items: [], total_price: 0 },
    refetch,
  } = useQuery<InventoryData>({
    queryKey: ["inventory", filters],
    queryFn: async () => {
      /** Validation */
      if (filters.dt_from && filters.dt_to) {
        if (new Date(filters.dt_from) > new Date(filters.dt_to)) {
          /** We could also just swap the dates around to ensure the request always goes through */
          return { items: [], total_price: 0 };
        }
      }
      /** IMPORTANT:
       *  This can be rather costly if the inventory is large. Normally we would retrieve
       *  all the items, then filter them on the client side.
       *  But the requirement here is to query on the server side with filters.
       */
      const cleanedFilters = cleanObject(filters);
      const response = await getInventory(cleanedFilters);
      if (response.status !== 200) {
        throw new Error(response.message);
      }

      /** Get the categories */
      if (response.data && response.data.items.length > 0) {
        const categories = response.data.items.map((item) => item.category);
        setCategories([...new Set(categories)]);
      } else {
        setCategories([]);
      }

      /** Return the data */
      return response.data ?? { items: [], total_price: 0 };
    },
  });

  /** Modal States */
  const [openAddItem, setOpenAddItem] = useState(false);
  const [openAdditionalFilters, setOpenAdditionalFilters] = useState(false);

  /** Handlers */
  const handleOnDateChange = (key: string, dateStr: string) => {
    setFilters((prev) => ({ ...prev, [key]: dateStr }));
  };

  const handleOnMenuItemClick = (value: string) => {
    /** Toggle the category if the same item is clicked */
    if (filters.category === value) {
      setFilters((prev) => ({ ...prev, category: "" }));
    } else {
      setFilters((prev) => ({ ...prev, category: value }));
    }
  };

  // const handleOnMenuItemClick = (key: string, value: string) => {
  //   setFilters((prev) => ({ ...prev, [key]: value }));
  // }

  // const handleOnCategoriesChange = (e: SelectChangeEvent<string[]>) => {
  //   let categories = e.target.value as string[];
  //   setFilters((prev) => ({ ...prev, categories }));
  // };

  return (
    <>
      {/** Header */}
      <Box className="flex flex-row">
        <Typography variant="h6">Inventory Management System</Typography>
      </Box>
      {/** Content */}
      <Box className="flex grow flex-col gap-3 py-4">
        {/** Actions */}
        <Box className="flex flex-col gap-4">
          <Box className="flex flex-row justify-end">
            {/** Add Button */}
            <Button variant="contained" onClick={() => setOpenAddItem(true)}>
              Add Item
            </Button>
            <AddItemDialog open={openAddItem} fnOnSubmit={() => refetch()} fnOnClose={() => setOpenAddItem(false)} />
            {/** DEVELOPMENT ONLY BUTTONS */}
            {process.env.NODE_ENV === "development" && (
              <Box className="flex flex-row gap-2 pl-2">
                <Button
                  variant="outlined"
                  onClick={async () => {
                    /** This function is not guaranteed to add 20 items
                     *  because of the uniqueness constraint on the name.
                     */
                    await populateInventory(20);
                    refetch();
                  }}
                >
                  Add Test Data
                </Button>
                <Button
                  variant="outlined"
                  onClick={async () => {
                    await clearInventory();
                    refetch();
                  }}
                >
                  Clear Inventory
                </Button>
                <Button variant="outlined" onClick={() => refetch()}>
                  Refresh
                </Button>
              </Box>
            )}
          </Box>
          {/** Date Range, Category */}
          <Box className="flex flex-row items-center gap-2">
            {/** Start Date */}
            <Box className="flex flex-row items-center gap-2">
              <Typography className="items-center">Filter by Date Range:</Typography>
              <DesktopDateTimePicker
                label="Search by start date"
                format={"YYYY-MM-DD HH:mm:ss"}
                views={["year", "month", "day", "hours", "minutes", "seconds"]}
                value={filters.dt_from ? dayjs(filters.dt_from) : null}
                onChange={(date) => handleOnDateChange("dt_from", dayjs(date).format("YYYY-MM-DD HH:mm:ss Z"))}
                onClose={() => refetch()}
                slotProps={{
                  popper: {
                    sx: {
                      "& .MuiMultiSectionDigitalClock-root>ul": {
                        width: "fit-content",
                      },
                    },
                  },
                  /** Prevent user from typing in the fields */
                  field: {
                    onKeyDown: (e) => {
                      e.preventDefault();
                    },
                  },
                }}
              />
              {/** End date */}
              <DesktopDateTimePicker
                label="Search by end date"
                format={"YYYY-MM-DD HH:mm:ss"}
                views={["year", "month", "day", "hours", "minutes", "seconds"]}
                value={filters.dt_to ? dayjs(filters.dt_to) : null}
                onChange={(date) => handleOnDateChange("dt_to", dayjs(date).format("YYYY-MM-DD HH:mm:ss Z"))}
                onClose={() => refetch()}
                slotProps={{
                  popper: {
                    sx: {
                      "& .MuiMultiSectionDigitalClock-root>ul": {
                        width: "fit-content",
                      },
                    },
                  },
                  /** Prevent user from typing in the fields */
                  field: {
                    onKeyDown: (e) => {
                      e.preventDefault();
                    },
                  },
                }}
              />
            </Box>
            {/** Category Filter */}
            <Box className="flex flex-row items-center gap-2">
              <Typography className="items-center">Filter by category:</Typography>
              <Select
                className="flex min-w-[180px] flex-row"
                name="category"
                size="small"
                value={filters.category}
                // value={filters.categories}
                // onChange={handleOnCategoriesChange}
                // multiple
                onClose={() => refetch()}
                displayEmpty
                renderValue={(selected) => (
                  <Box className="flex flex-row gap-2">
                    {/* {selected.length === 0 ? <Chip key={"all"} label="All" /> : selected.map((value) => <Chip key={value} label={value} />)} */}
                    {selected ? <Chip label={selected} /> : <Chip key={"all"} label="All" />}
                  </Box>
                )}
              >
                <MenuItem value="" onClick={() => handleOnMenuItemClick("")}>
                  <Checkbox checked={filters.category === ""} />
                  All
                </MenuItem>
                {categories.map((category, index) => (
                  <MenuItem key={index} value={category} onClick={() => handleOnMenuItemClick(category)}>
                    {/* <Checkbox checked={filters.categories?.includes(category)} /> */}
                    <Checkbox checked={filters.category === category} />
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Box>
        </Box>
        {/** Table */}
        <Box className="flex grow flex-col">
          {isError ? (
            <Box className="flex grow flex-col items-center justify-center gap-2">
              {/** We don't want to expose the internal error messages so we just show a generic message */}
              <Typography className="text-red-500">An error has occurred. Please try again later.</Typography>
              <Button variant="outlined" onClick={() => refetch()}>
                Click to Retry
              </Button>
            </Box>
          ) : (
            <InventoryTable data={data} isLoading={isLoading} />
          )}
        </Box>
      </Box>
    </>
  );
};

export default Inventory;
