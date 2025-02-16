"use client";

import { Dispatch, SetStateAction, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, TextField, Typography } from "@mui/material";
import FormInput from "../../form/FormInput.tsx";
import { AdditionalInventoryFilters, AdditionalInventoryFiltersSchema } from "../types/InventoryTypes.ts";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export interface AdditionalFiltersDialogProps {
  open: boolean;
  availableCategories: string[];
  additionalFilters: AdditionalInventoryFilters;
  fnSetAdditionalFilters: Dispatch<SetStateAction<AdditionalInventoryFilters>>;
  fnOnSubmit: () => void;
  fnOnClose: () => void;
}

export const AdditionalFiltersDialog = (props: AdditionalFiltersDialogProps) => {
  /** IMPORTANT:
   *  Used only for the bonus task
   */

  /** Form */
  const form = useForm<AdditionalInventoryFilters>({
    resolver: zodResolver(AdditionalInventoryFiltersSchema),
    defaultValues: {
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
    },
    mode: "onChange",
  });

  useEffect(() => {
    form.reset(props.additionalFilters);
  }, [props.additionalFilters]);

  return (
    <FormProvider {...form}>
      <Dialog
        open={props.open}
        onClose={() => {
          form.reset();
          props.fnOnClose();
        }}
        slotProps={{
          paper: {
            className: "min-w-[400px]",
          },
        }}
      >
        <DialogTitle>Additional Filters</DialogTitle>
        <DialogContent>
          <Box className="flex flex-col gap-2" component={"form"}>
            <Box className="flex flex-row gap-2">
              {/** Headers */}
              <Box className="flex w-fit flex-col justify-center gap-2">
                <Typography className="flex h-full items-center">Name : </Typography>
                <Typography className="flex h-full items-center">Category : </Typography>
                <Typography className="flex h-full items-center">Price Range : </Typography>
                <Typography className="flex h-full items-center">Pagination : </Typography>
                <Typography className="flex h-full items-center">Sort by : </Typography>
              </Box>
              {/** Items */}
              <Box className="flex flex-1 flex-col justify-center gap-2">
                {/** Name */}
                <Box className="flex flex-row gap-2">
                  <FormInput<AdditionalInventoryFilters>
                    control={form.control}
                    name="filters.name"
                    component={
                      <TextField className="min-w-[240px]" variant="outlined" type="text" placeholder="Name" autoComplete="off" size="small" />
                    }
                  />
                </Box>
                {/** Category */}
                <Box className="flex flex-row gap-2">
                  <FormInput<AdditionalInventoryFilters>
                    control={form.control}
                    name="filters.category"
                    component={
                      // <TextField className="min-w-[240px]" variant="outlined" type="text" placeholder="Category" autoComplete="off" size="small" />
                      <Select className="min-w-[240px]" size="small" displayEmpty>
                        <MenuItem value="">None</MenuItem>
                        {props.availableCategories.map((category, index) => (
                          <MenuItem key={index} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    }
                  />
                </Box>
                {/** Price Range */}
                <Box className="flex flex-row gap-2">
                  <FormInput<AdditionalInventoryFilters>
                    control={form.control}
                    name="filters.price_range.0"
                    component={
                      <TextField className="min-w-[120px]" variant="outlined" type="text" placeholder="Min Price" autoComplete="off" size="small" />
                    }
                    fnOnChange={(e) => {
                      /** Custom validator */
                      const inputValue = e.target.value.replace(/\s/g, ""); // Remove all spaces
                      const value = Number(inputValue);
                      if (!isNaN(value) || inputValue === "." || inputValue === "") {
                        form.setValue("filters.price_range.0", inputValue);
                      }
                      form.trigger("filters.price_range.0");
                    }}
                  />
                  <FormInput<AdditionalInventoryFilters>
                    control={form.control}
                    name="filters.price_range.1"
                    component={
                      <TextField className="min-w-[120px]" variant="outlined" type="text" placeholder="Max Price" autoComplete="off" size="small" />
                    }
                    fnOnChange={(e) => {
                      /** Custom validator */
                      const inputValue = e.target.value.replace(/\s/g, ""); // Remove all spaces
                      const value = Number(inputValue);
                      if (!isNaN(value) || inputValue === "." || inputValue === "") {
                        form.setValue("filters.price_range.1", inputValue);
                      }
                      form.trigger("filters.price_range.1");
                    }}
                  />
                </Box>
                {/** Pagination */}
                <Box className="flex flex-row gap-2">
                  <FormInput<AdditionalInventoryFilters>
                    control={form.control}
                    name="pagination.page"
                    component={
                      <TextField className="min-w-[120px]" variant="outlined" type="text" placeholder="Page no." autoComplete="off" size="small" />
                    }
                    fnOnChange={(e) => {
                      /** Custom validator */
                      const inputValue = e.target.value.replace(/\s/g, "").replace(/^0+/, ""); // Remove all spaces and trailing zeroes
                      const value = Number(inputValue);
                      if (!isNaN(value) || inputValue === "" || value > 0) {
                        form.setValue("pagination.page", inputValue);
                      }
                      form.trigger("pagination.page");
                    }}
                  />
                  <FormInput<AdditionalInventoryFilters>
                    control={form.control}
                    name="pagination.limit"
                    component={
                      <TextField className="min-w-[120px]" variant="outlined" type="text" placeholder="Item Limit" autoComplete="off" size="small" />
                    }
                    fnOnChange={(e) => {
                      /** Custom validator */
                      const inputValue = e.target.value.replace(/\s/g, "").replace(/^0+/, ""); // Remove all spaces and trailing zeroes
                      const value = Number(inputValue);
                      if (!isNaN(value) || inputValue === "" || value > 0) {
                        form.setValue("pagination.limit", inputValue);
                      }
                      form.trigger("pagination.limit");
                    }}
                  />
                </Box>
                {/** Sort by*/}
                <Box className="flex flex-row gap-2">
                  <FormInput<AdditionalInventoryFilters>
                    control={form.control}
                    name="sort.field"
                    component={
                      <Select className="min-w-[120px]" size="small" displayEmpty>
                        <MenuItem value="">None</MenuItem>
                        <MenuItem value="name">Name</MenuItem>
                        <MenuItem value="price">Price</MenuItem>
                        <MenuItem value="category">Category</MenuItem>
                      </Select>
                    }
                  />
                  {/** Order */}
                  <FormInput<AdditionalInventoryFilters>
                    control={form.control}
                    name="sort.order"
                    component={
                      <Select className="min-w-[120px]" size="small" displayEmpty>
                        <MenuItem value="">None</MenuItem>
                        <MenuItem value="asc">Ascending</MenuItem>
                        <MenuItem value="desc">Descending</MenuItem>
                      </Select>
                    }
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        {/** Buttons */}
        <DialogActions className="flex flex-row">
          {process.env.NODE_ENV === "development" && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                console.log(form.getValues());
                console.log(AdditionalInventoryFiltersSchema.safeParse(form.getValues()).error);
                form.trigger();
              }}
            >
              Trigger
            </Button>
          )}
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              form.reset();
              props.fnOnClose();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              props.fnSetAdditionalFilters(form.getValues());
              props.fnOnSubmit();
              props.fnOnClose();
            }}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </FormProvider>
  );
};

export default AdditionalFiltersDialog;
