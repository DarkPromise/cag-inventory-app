"use client";

import { useEffect, useState } from "react";
import { getInventory } from "./actions/getInventory.ts";
import InventoryTable from "./InventoryTable.tsx";
import { useQuery } from "@tanstack/react-query";
import AddItemDialog from "./dialogs/AddItemDialog.tsx";
import { Box, Button, Checkbox, Chip, MenuItem, Select, Typography } from "@mui/material";
import { DesktopDateTimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import clearInventory from "./actions/clearInventory.ts";
import { cleanObject } from "./utils/cleanObject.ts";
import populateInventory from "./actions/populateInventory.ts";
import { getInventoryWithFilters } from "./actions/getInventoryWithFilters.ts";
import AdditionalFiltersDialog from "./dialogs/AdditionalFiltersDialog.tsx";
import {
  InventoryItem,
  InventoryFilters,
  AdditionalInventoryFilters,
  InventoryData,
  AdditionalInventoryFiltersSchema,
  InventoryFiltersSchema,
} from "./types/InventoryTypes.ts";

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
  const [defaultFilters, setDefaultFilters] = useState<InventoryFilters>({
    dt_from: "",
    dt_to: "",
    category: "",
  });

  /** Additional Filters
   *  The additional filters are used for the bonus task
   *  They are applied on top of the default filters
   */
  const [useAdditionalFilters, setUseAdditionalFilters] = useState(false);
  const [additionalFilters, setAdditionalFilters] = useState<AdditionalInventoryFilters>({
    dt_from: "",
    dt_to: "",
    filters: {
      name: "",
      category: "",
      price_range: ["", ""],
    },
    pagination: {
      page: "",
      limit: "",
    },
    sort: {
      field: "",
      order: "",
    },
  });

  /** Query Inventory Data (using react-query)
   *  IMPORTANT:
   *  This can be rather costly if the inventory is large, because
   *  in order to use filters on the server side, we need to use ScanTable in DynamoDB.
   *  Security wise - we should not be returning the entire inventory.
   *  Efficiency wise - we should be paginating the results.
   *  Cost-efficient wise - we would retrieve all the items, cache it (and invalidate it when needed), then filter them on the client side.
   *  But the requirement here is to query on the server side with filters.
   *
   *  IMPORTANT:
   *  Once the additional filters are toggled, there is no way to go back to the usage of the default query.
   *  This is because the additional filters are applied on top of the default filters.
   *  (A reset button could be added to reset the the usage though)
   */
  const {
    isFetching,
    isError,
    error,
    data = { items: [], total_price: 0 },
    refetch,
  } = useQuery<InventoryData>({
    queryKey: ["inventory", defaultFilters, additionalFilters, useAdditionalFilters],
    queryFn: async () => {
      /** Validation */
      if (defaultFilters.dt_from && defaultFilters.dt_to) {
        if (new Date(defaultFilters.dt_from) > new Date(defaultFilters.dt_to)) {
          /** We could also just swap the dates around to ensure the request always goes through */
          return { items: [], total_price: 0 };
        }
      }

      /** BONUS TASK
       *  If we're using the additional filters, we call a different but similar function
       *  that accepts additional filters.
       *  Ideally, we should combine the filters and pass them to the same function.
       */
      if (useAdditionalFilters) {
        /** Clean the additional filters */
        const cleanedAdditionalFilters = cleanObject(additionalFilters);
        const result = AdditionalInventoryFiltersSchema.safeParse(cleanedAdditionalFilters);
        if (!result.success) {
          throw new Error("Invalid Additional Filters");
        }

        /** Query the inventory with additional filters */
        const response = await getInventoryWithFilters(result.data as AdditionalInventoryFilters);
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
      } else {
        /** Clean the filters */
        const cleanedFilters = cleanObject(defaultFilters);
        const result = InventoryFiltersSchema.safeParse(cleanedFilters);
        if (!result.success) {
          throw new Error("Invalid Filters");
        }

        /** Query the inventory */
        const response = await getInventory(result.data);
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
      }
    },
  });

  /** Modal States */
  const [openAddItem, setOpenAddItem] = useState(false);
  const [openAdditionalFilters, setOpenAdditionalFilters] = useState(false);

  /** Handlers */
  const handleOnDateChange = (key: string, dateStr: string) => {
    setDefaultFilters((prev) => ({ ...prev, [key]: dateStr }));
  };

  const handleOnMenuItemClick = (value: string) => {
    if (defaultFilters.category === value) {
      setDefaultFilters((prev) => ({ ...prev, category: "" }));
    }
  };

  /** Effects */
  useEffect(() => {
    setAdditionalFilters((prev) => ({ ...prev, ...defaultFilters, filters: { ...prev.filters, category: defaultFilters.category } }));
  }, [defaultFilters]);

  useEffect(() => {
    setDefaultFilters((prev) => ({ ...prev, category: additionalFilters.filters?.category }));
  }, [additionalFilters.filters?.category]);

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
                value={defaultFilters.dt_from ? dayjs(defaultFilters.dt_from) : null}
                onChange={(date) => handleOnDateChange("dt_from", dayjs(date).format("YYYY-MM-DD HH:mm:ss Z"))}
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
                value={defaultFilters.dt_to ? dayjs(defaultFilters.dt_to) : null}
                onChange={(date) => handleOnDateChange("dt_to", dayjs(date).format("YYYY-MM-DD HH:mm:ss Z"))}
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
                value={defaultFilters.category}
                onChange={(e) => {
                  setDefaultFilters((prev) => ({ ...prev, category: e.target.value }));
                }}
                // value={filters.categories}
                // onChange={handleOnCategoriesChange}
                // multiple
                displayEmpty
                renderValue={(selected) => (
                  <Box className="flex flex-row gap-2">
                    {/* {selected.length === 0 ? <Chip key={"all"} label="All" /> : selected.map((value) => <Chip key={value} label={value} />)} */}
                    {selected ? <Chip label={selected} /> : <Chip key={"all"} label="All" />}
                  </Box>
                )}
              >
                <MenuItem value="">
                  <Checkbox checked={defaultFilters.category === ""} />
                  All
                </MenuItem>
                {categories.map((category, index) => (
                  <MenuItem key={index} value={category} onClick={() => handleOnMenuItemClick(category)}>
                    {/* <Checkbox checked={filters.categories?.includes(category)} /> */}
                    <Checkbox checked={defaultFilters.category === category} />
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Box>
          {/** Additional Filters */}
          <Box className="flex flex-row items-center gap-2">
            <Button variant="contained" onClick={() => setOpenAdditionalFilters(true)}>
              Additional Filters
            </Button>
            <AdditionalFiltersDialog
              open={openAdditionalFilters}
              availableCategories={categories}
              additionalFilters={additionalFilters}
              fnSetAdditionalFilters={setAdditionalFilters}
              fnOnSubmit={() => {
                setUseAdditionalFilters(true);
                setOpenAdditionalFilters(false);
              }}
              fnOnClose={() => setOpenAdditionalFilters(false)}
            />
            <Button
              variant="contained"
              onClick={() => {
                setUseAdditionalFilters(false);
                setAdditionalFilters({
                  dt_from: "",
                  dt_to: "",
                  filters: {
                    name: "",
                    category: "",
                    price_range: ["", ""],
                  },
                  pagination: {
                    page: "",
                    limit: "",
                  },
                  sort: {
                    field: "",
                    order: "",
                  },
                });
              }}
            >
              Reset Additional Filters
            </Button>
          </Box>
        </Box>
        {/** Table */}
        <Box className="flex grow flex-col">
          {isError ? (
            <Box className="flex grow flex-col items-center justify-center gap-2">
              {/** We don't want to expose the internal error messages so we just show a generic message */}
              <Typography className="text-red-500">An error has occurred. Please try again later.</Typography>
              {process.env.NODE_ENV === "development" && <Typography className="text-red-500">Error: {error.message} </Typography>}
              <Button
                variant="outlined"
                onClick={() => {
                  setDefaultFilters({
                    dt_from: "",
                    dt_to: "",
                    category: "",
                  });
                  setUseAdditionalFilters(false);
                  setAdditionalFilters({
                    dt_from: "",
                    dt_to: "",
                    filters: {
                      name: "",
                      category: "",
                      price_range: ["", ""],
                    },
                    pagination: {
                      page: "",
                      limit: "",
                    },
                    sort: {
                      field: "",
                      order: "",
                    },
                  });
                }}
              >
                Click to Retry
              </Button>
            </Box>
          ) : (
            <InventoryTable data={data} isFetching={isFetching} />
          )}
        </Box>
      </Box>
    </>
  );
};

export default Inventory;
