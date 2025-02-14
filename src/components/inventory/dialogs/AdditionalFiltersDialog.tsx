"use client";

import { Dispatch, SetStateAction } from "react";
import { InventoryFilters } from "../../../types/Common.ts";
import { FormProvider, useForm } from "react-hook-form";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, TextField, Typography } from "@mui/material";
import FormInput from "../../form/FormInput.tsx";

export interface AdditionalFiltersDialogProps {
  open: boolean;
  fnSetFilters: Dispatch<SetStateAction<InventoryFilters>>;
  fnOnSubmit: () => void;
  fnOnClose: () => void;
}

export const AdditionalFiltersDialog = (props: AdditionalFiltersDialogProps) => {
  /** IMPORTANT:
   *  Used only for the bonus task
   */

  /** Form */
  const form = useForm<InventoryFilters>({
    mode: "onChange",
  });

  /** Theres no form state or action to manage here
   *  We are just using the form to get the values
   */

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
                <Typography className="flex h-full items-center">Price Range : </Typography>
                <Typography className="flex h-full items-center">Pagination : </Typography>
                <Typography className="flex h-full items-center">Sort by : </Typography>
              </Box>
              {/** Items */}
              <Box className="flex flex-1 flex-col justify-center gap-2">
                {/** Price Range */}
                <Box className="flex flex-row items-center gap-2">
                  <FormInput<InventoryFilters>
                    control={form.control}
                    name="price_range.0"
                    component={
                      <TextField className="w-[120px]" variant="outlined" type="text" placeholder="Min Price" autoComplete="off" size="small" />
                    }
                    fnOnChange={(e) => {
                      /** Custom validator */
                      const inputValue = e.target.value.replace(/\s/g, ""); // Remove all spaces
                      const value = Number(inputValue);
                      if (!isNaN(value) || inputValue === "." || inputValue === "") {
                        form.setValue("price_range.0", inputValue);
                      }
                      form.trigger("price_range.0");
                    }}
                  />
                  <FormInput<InventoryFilters>
                    control={form.control}
                    name="price_range.1"
                    component={
                      <TextField className="w-[120px]" variant="outlined" type="text" placeholder="Max Price" autoComplete="off" size="small" />
                    }
                    fnOnChange={(e) => {
                      /** Custom validator */
                      const inputValue = e.target.value.replace(/\s/g, ""); // Remove all spaces
                      const value = Number(inputValue);
                      if (!isNaN(value) || inputValue === "." || inputValue === "") {
                        form.setValue("price_range.1", inputValue);
                      }
                      form.trigger("price_range.1");
                    }}
                  />
                </Box>
                {/** Pagination */}
                <Box className="flex flex-row items-center gap-2">
                  <FormInput<InventoryFilters>
                    control={form.control}
                    name="pagination.page"
                    component={
                      <TextField className="w-[120px]" variant="outlined" type="text" placeholder="Max Pages" autoComplete="off" size="small" />
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
                  <FormInput<InventoryFilters>
                    control={form.control}
                    name="pagination.limit"
                    component={
                      <TextField className="w-[120px]" variant="outlined" type="text" placeholder="Item Limit" autoComplete="off" size="small" />
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
                <Box className="flex flex-row items-center gap-2">
                  <FormInput<InventoryFilters>
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
                  <FormInput<InventoryFilters>
                    control={form.control}
                    name="sort.order"
                    component={
                      <Select className="min-w-[140px]" size="small" displayEmpty>
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
          <Button variant="contained" size="small" onClick={props.fnOnClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              props.fnSetFilters((prev: InventoryFilters) => ({
                ...prev,
                ...form.getValues(),
              }));
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
