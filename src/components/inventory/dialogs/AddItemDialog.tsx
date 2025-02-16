"use client";

import { useActionState, useEffect, useState } from "react";
import { addItemFA } from "../actions/addItem.ts";
import { FormProvider, useForm } from "react-hook-form";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import FormInput from "../../form/FormInput.tsx";
import { InventoryItem, InventoryItemSchema } from "../types/InventoryTypes.ts";
import { zodResolver } from "@hookform/resolvers/zod";

export interface AddItemDialogProps {
  open: boolean;
  fnOnSubmit: () => void;
  fnOnClose: () => void;
}

export const AddItemDialog = (props: AddItemDialogProps) => {
  /** IMPORTANT:
   *  Turns out Antd form's have issues with Next.js server actions,
   *  So I opted to use react-hook-form with MUI components instead.
   */

  /** Form */
  const form = useForm<InventoryItem>({
    resolver: zodResolver(InventoryItemSchema),
    defaultValues: {
      name: "",
      price: 0,
      category: "",
    },
    mode: "onChange",
  });

  /** Form State & Action */
  const [formState, formAction, isPending] = useActionState(addItemFA, {
    status: 0,
    message: "",
  });

  /** Form Message */
  const [formMessage, setFormMessage] = useState<string>("");

  /** Effects */
  useEffect(() => {
    if (formState.status === 200) {
      props.fnOnSubmit();
    } else {
      setFormMessage(formState.message);
    }
  }, [formState, form]);

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
        <DialogTitle>Add Item</DialogTitle>
        <DialogContent>
          <Box className="flex flex-col gap-2" component={"form"} action={formAction}>
            {/** Name */}
            <FormInput<InventoryItem>
              label="Name"
              control={form.control}
              rules={{ required: "Name is required" }}
              name={"name"}
              component={
                <TextField
                  className="w-full"
                  variant="outlined"
                  type="text"
                  autoComplete="off"
                  size="small"
                  slotProps={{
                    input: {
                      className: "text-normal",
                    },
                  }}
                />
              }
            />
            {/** Price */}
            <FormInput<InventoryItem>
              label="Price"
              control={form.control}
              rules={{ required: "Price is required" }}
              name={"price"}
              component={
                <TextField
                  className="w-full"
                  variant="outlined"
                  type="text"
                  autoComplete="off"
                  size="small"
                  slotProps={{
                    input: {
                      className: "text-normal",
                    },
                  }}
                />
              }
              fnOnChange={(e) => {
                /** Custom validator */
                const inputValue = e.target.value.replace(/\s/g, ""); // Remove all spaces
                const value = Number(inputValue);
                if (!isNaN(value) || inputValue === "." || inputValue === "") {
                  form.setValue("price", inputValue);
                }
                form.trigger("price");
              }}
            />
            {/** Category */}
            <FormInput<InventoryItem>
              label="Category"
              control={form.control}
              rules={{ required: "Category is required" }}
              name={"category"}
              component={
                <TextField
                  className="w-full"
                  variant="outlined"
                  type="text"
                  autoComplete="off"
                  size="small"
                  slotProps={{
                    input: {
                      className: "text-normal",
                    },
                  }}
                />
              }
            />
            {/** Message */}
            {formMessage && <Box className="text-sm text-red-500">{formMessage}</Box>}
            {/** Buttons */}
            <DialogActions className="flex flex-row p-0 pt-1">
              <Button variant="contained" size="small" onClick={props.fnOnClose}>
                Cancel
              </Button>
              <Button variant="contained" size="small" type="submit" loading={isPending}>
                Add Item
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </FormProvider>
  );
};

export default AddItemDialog;
